import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Address = require("../../src/domain/Address");
const Customer = require("../../src/domain/Customer");
const OrderItem = require("../../src/domain/OrderItem");
const Product = require("../../src/domain/Product");
const OrderService = require("../../src/services/OrderService");

function createCustomer(overrides = {}) {
  return new Customer({
    id: "c1",
    name: "Ana Souza",
    email: "ana@example.com",
    phone: "18999990000",
    type: "regular",
    ...overrides,
    address: new Address({
      street: "Rua das Flores",
      number: "10",
      city: "São Paulo",
      state: "SP",
      zipCode: "01000-000",
      region: "sudeste",
      ...overrides.address
    })
  });
}

function createProduct(overrides = {}) {
  return new Product({
    id: "p1",
    name: "Produto",
    category: "eletrônicos",
    price: 100,
    weight: 1,
    stock: 20,
    ...overrides
  });
}

function createItem(productOverrides = {}, quantity = 1) {
  return new OrderItem({
    product: createProduct(productOverrides),
    quantity
  });
}

function createOrder(overrides = {}) {
  return {
    id: "o1",
    customer: createCustomer(),
    items: [createItem()],
    couponCode: "NONE",
    paymentMethod: "credit_card",
    installments: 1,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides
  };
}

function createService(items = []) {
  const products = new Map(
    items
      .filter((item) => item.product instanceof Product)
      .map((item) => [item.product.id, item.product])
  );
  const updatedStock = [];
  const savedOrders = [];
  const notifications = [];
  const warnings = [];
  const service = new OrderService({
    productRepository: {
      findById(id) {
        return products.get(id);
      },
      updateStock(id, quantity) {
        updatedStock.push([id, quantity]);
      }
    },
    orderRepository: {
      save(summary) {
        savedOrders.push(summary);
      }
    },
    notificationService: {
      notify(...args) {
        notifications.push(args);
      return args[1].isConfirmed();
      }
    },
    logger: {
      info() {},
      warn(message) {
        warnings.push(message);
      }
    },
    outputHandler: []
  });

  return { service, products, updatedStock, savedOrders, notifications, warnings };
}

describe("OrderService", () => {
  it.each([
    {
      name: "cliente ausente",
      order: createOrder({ customer: null }),
      message: "O cliente não pode ser vazio ou inválido"
    },
    {
      name: "itens que não são instâncias válidas",
      order: createOrder({ items: [{}] }),
      message: "Os itens do pedido não podem ser vazios ou inválidos"
    }
  ])("rejeita $name", ({ order, message }) => {
    const { service } = createService(order.items);

    expect(() => service.process(order)).toThrowError(message);
  });

  it("rejeita um produto que não existe", () => {
    const order = createOrder({ items: [createItem({ id: "inexistente" })] });
    const { service, products, updatedStock, savedOrders } = createService(order.items);
    products.delete("inexistente");

    expect(() => service.process(order)).toThrowError("Produto inexistente nao encontrado.");
    expect(updatedStock).toEqual([]);
    expect(savedOrders).toEqual([]);
  });

  it("rejeita produtos sem estoque suficiente", () => {
    const order = createOrder({ items: [createItem({}, 21)] });
    const { service, updatedStock, savedOrders } = createService(order.items);

    expect(() => service.process(order)).toThrowError("Estoque insuficiente para Produto.");
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
    const { service, updatedStock, savedOrders, notifications } = createService(order.items);

    const summary = service.process(order);

    expect(summary.subtotal).toBe(200);
    expect(summary.discount).toBe(42);
    expect(summary.freight).toBe(28);
    expect(summary.paymentFee).toBe(0);
    expect(summary.total).toBe(186);
    expect(summary.status).toBe("confirmed");
    expect(summary.items).toEqual([
      { productId: "p1", name: "Produto", quantity: 2, subtotal: 200 }
    ]);
    expect(updatedStock).toEqual([["p1", 2]]);
    expect(savedOrders).toEqual([summary]);
    expect(notifications).toEqual([[order.customer, summary]]);
  });

  it("aplica descontos de funcionário, pedido alto e parcelamento", () => {
    const order = createOrder({
      customer: createCustomer({ type: "employee", address: { region: "sul" } }),
      items: [createItem({ price: 5000, weight: 1 }, 2)],
      installments: 3
    });
    const { service } = createService(order.items);

    const summary = service.process(order);

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
    const { service, notifications, warnings } = createService(order.items);

    const summary = service.process(order);

    expect(summary.freight).toBe(0);
    expect(summary.paymentFee).toBe(0);
    expect(summary.total).toBe(100);
    expect(summary.status).toBe("waiting_payment");
    expect(notifications).toEqual([[order.customer, summary]]);
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
    const { service } = createService(order.items);

    const summary = service.process(order);

    expect(summary.freight).toBe(freight);
    expect(summary.total).toBe(100 + freight);
  });

  it("rejeita formas de pagamento inválidas sem atualizar estoque", () => {
    const order = createOrder({ paymentMethod: "dinheiro" });
    const { service, updatedStock, savedOrders } = createService(order.items);

    expect(() => service.process(order)).toThrowError("Forma de pagamento invalida.");
    expect(updatedStock).toEqual([]);
    expect(savedOrders).toEqual([]);
  });

  it("rejeita totais não positivos sem atualizar estoque", () => {
    const item = createItem();
    item.product.price = -1;
    const order = createOrder({ items: [item], couponCode: "FRETEGRATIS" });
    const { service, updatedStock, savedOrders } = createService(order.items);

    expect(() => service.process(order)).toThrowError("Total do pedido invalido.");
    expect(updatedStock).toEqual([]);
    expect(savedOrders).toEqual([]);
  });
});
