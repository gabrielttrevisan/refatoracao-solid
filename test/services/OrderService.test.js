import { describe, expect, it } from "vitest";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

class NotificationServiceStub {
  sendOrderConfirmation() {}
}

const servicePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../src/services/OrderService.js"
);
const originalLoad = Module._load;

Module._load = function (request, parent, isMain) {
  if (parent && parent.filename === servicePath && request === "./NotificationService") {
    return NotificationServiceStub;
  }

  return originalLoad.call(this, request, parent, isMain);
};

let OrderService;
try {
  OrderService = require(servicePath);
} finally {
  Module._load = originalLoad;
}

function createCustomer(overrides = {}) {
  return {
    name: "Ana Souza",
    email: "ana@example.com",
    type: "regular",
    ...overrides,
    address: {
      city: "Sao Paulo",
      state: "SP",
      region: "sudeste",
      ...((overrides && overrides.address) || {})
    }
  };
}

function createItem(product = {}, quantity = 1) {
  const itemProduct = {
    id: "p1",
    name: "Produto",
    price: 100,
    weight: 1,
    ...product
  };

  return {
    product: itemProduct,
    quantity,
    getSubtotal() {
      return this.product.price * this.quantity;
    }
  };
}

function createItemWithoutProduct() {
  const item = createItem();
  item.product = null;
  return item;
}

function createOrder(overrides = {}) {
  const items = [createItem()];

  return {
    id: "o1",
    customer: createCustomer(),
    items,
    paymentMethod: "credit_card",
    installments: 1,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    getTotalItems() {
      return this.items.reduce((total, item) => total + item.quantity, 0);
    },
    ...overrides
  };
}

function createService(order) {
  const products = new Map(
    order.items
      .filter((item) => item.product)
      .map((item) => [item.product.id, { ...item.product, stock: 20 }])
  );
  const updatedStock = [];
  const savedOrders = [];
  const notifications = [];
  const warnings = [];
  const service = new OrderService();

  service.productRepository = {
    findById(id) {
      return products.get(id);
    },
    updateStock(id, quantity) {
      updatedStock.push([id, quantity]);
    }
  };
  service.orderRepository = {
    save(summary) {
      savedOrders.push(summary);
    }
  };
  service.notificationService = {
    sendOrderConfirmation(...args) {
      notifications.push(args);
    }
  };
  service.logger = {
    info() {},
    warn(message) {
      warnings.push(message);
    }
  };

  return { service, products, updatedStock, savedOrders, notifications, warnings };
}

function processOrder(service, order) {
  return service.process(order);
}

describe("OrderService", () => {
  const invalidCustomerOrders = [
    { name: "cliente ausente", order: createOrder({ customer: null }), message: "Cliente obrigatorio." },
    {
      name: "e-mail inválido",
      order: createOrder({ customer: createCustomer({ email: "invalid-email" }) }),
      message: "E-mail do cliente invalido."
    },
    { name: "pedido sem itens", order: createOrder({ items: [] }), message: "Pedido sem itens." }
  ];

  it.each(invalidCustomerOrders)("rejeita $name", ({ order, message }) => {
    const { service } = createService(order);
    expect(() => service.process(order)).toThrowError(new Error(message));
  });

  const invalidItems = [
    {
      name: "item sem produto",
      order: createOrder({ items: [createItemWithoutProduct()] }),
      message: "Item sem produto."
    },
    {
      name: "quantidade zero",
      order: createOrder({ items: [createItem({}, 0)] }),
      message: "Quantidade invalida."
    },
    {
      name: "produto não encontrado",
      order: createOrder({ items: [createItem({ id: "missing" })] }),
      message: "Produto missing nao encontrado."
    },
    {
      name: "estoque insuficiente",
      order: createOrder({ items: [createItem({}, 21)] }),
      message: "Estoque insuficiente para Produto."
    }
  ];

  it.each(invalidItems)("rejeita $name", ({ name, order, message }) => {
    const { service, updatedStock, savedOrders, products } = createService(order);
    if (name === "produto não encontrado") {
      products.delete("missing");
    }
    expect(() => service.process(order)).toThrowError(new Error(message));
    expect(updatedStock).toEqual([]);
    expect(savedOrders).toEqual([]);
  });

  it("calcula um pedido VIP via PIX e o confirma", () => {
    const order = createOrder({
      customer: createCustomer({ type: "vip" }),
      items: [createItem({ price: 100, weight: 1 }, 2)],
      couponCode: "TECH10",
      paymentMethod: "pix"
    });
    const { service, updatedStock, savedOrders, notifications } = createService(order);

    const summary = processOrder(service, order);

    expect(summary.subtotal).toBe(200);
    expect(summary.discount).toBe(42);
    expect(summary.freight).toBe(28);
    expect(summary.paymentFee).toBe(0);
    expect(summary.total).toBe(186);
    expect(summary.status).toBe("confirmed");
    expect(order.status).toBe("confirmed");
    expect(summary.items).toEqual([
      { productId: "p1", name: "Produto", quantity: 2, subtotal: 200 }
    ]);
    expect(updatedStock).toEqual([["p1", 2]]);
    expect(savedOrders).toEqual([summary]);
    expect(notifications).toEqual([[order.customer, order.id, 186]]);
  });

  it("aplica descontos de funcionário, pedido alto e parcelamento", () => {
    const order = createOrder({
      customer: createCustomer({ type: "employee", address: { region: "sul" } }),
      items: [createItem({ price: 5000, weight: 1 }, 2)],
      paymentMethod: "credit_card",
      installments: 3
    });
    const { service } = createService(order);

    const summary = processOrder(service, order);

    expect(summary.subtotal).toBe(10000);
    expect(summary.discount).toBe(1750);
    expect(summary.freight).toBe(38);
    expect(summary.paymentFee).toBe(250);
    expect(summary.total).toBe(8538);
  });

  it("aplica frete grátis e aguarda o pagamento por boleto", () => {
    const order = createOrder({
      couponCode: "FRETEGRATIS",
      paymentMethod: "boleto"
    });
    const { service, notifications, warnings } = createService(order);

    const summary = processOrder(service, order);

    expect(summary.freight).toBe(0);
    expect(summary.paymentFee).toBe(0);
    expect(summary.total).toBe(100);
    expect(summary.status).toBe("waiting_payment");
    expect(order.status).toBe("waiting_payment");
    expect(notifications).toEqual([]);
    expect(warnings).toEqual(["Pedido o1 aguardando pagamento."]);
  });

  it.each([
    { name: "sudeste", region: "sudeste", freight: 24 },
    { name: "sul", region: "sul", freight: 33 },
    { name: "centro-oeste", region: "centro-oeste", freight: 41 },
    { name: "nordeste", region: "nordeste", freight: 52 },
    { name: "norte", region: "norte", freight: 69 },
    { name: "região desconhecida", region: "unknown", freight: 58 }
  ])("calcula o frete para $name", ({ region, freight }) => {
    const order = createOrder({
      customer: createCustomer({ address: { region } }),
      items: [createItem({ weight: 1 }, 1)]
    });
    const { service } = createService(order);

    const summary = processOrder(service, order);

    expect(summary.freight).toBe(freight);
    expect(summary.total).toBe(100 + freight);
  });

  const invalidPayments = [
    {
      name: "forma de pagamento inválida",
      order: createOrder({ paymentMethod: "cash" }),
      message: "Forma de pagamento invalida."
    },
    {
      name: "total não positivo",
      order: createOrder({
        items: [createItem({ price: -1 })],
        couponCode: "FRETEGRATIS"
      }),
      message: "Total do pedido invalido."
    }
  ];

  it.each(invalidPayments)("rejeita $name", ({ order, message }) => {
    const { service, updatedStock, savedOrders } = createService(order);
    expect(() => service.process(order)).toThrowError(new Error(message));
    expect(updatedStock).toEqual([]);
    expect(savedOrders).toEqual([]);
  });
});
