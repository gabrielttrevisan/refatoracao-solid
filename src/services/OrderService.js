const ProductRepository = require("../repositories/ProductRepository");
const OrderRepository = require("../repositories/OrderRepository");
const NotificationService = require("./NotificationService");
const Logger = require("../utils/Logger");
const OrderInput = require("../domain/OrderInput");
const OrderSummary = require("../domain/OrderSummary");
const OrderPricing = require("../domain/OrderPricing");
const OrderTypeDiscountPricingItem = require("../domain/pricing-item/OrderTypeDiscountPricingItem");
const CouponCodeDiscountPricingItem = require("../domain/pricing-item/CouponCodeDiscountPricingItem");
const HighTicketDiscountPricingItem = require("../domain/pricing-item/HighTicketDiscountPricingItem");
const FreightPricingItem = require("../domain/pricing-item/FreightPricingItem");
const PaymentMethodPricingItem = require("../domain/pricing-item/PaymentMethodPricingItem");
const JsonPrintOrder = require("../utils/print/JsonPrintOrder");
const ConsolePrintOrder = require("../utils/print/ConsolePrintOrder");

class OrderService {
  #pricing;
  #outputHandlers;
  #logger;
  #productRepository;
  #orderRepository;
  #notificationService;

  /**
   * @param {import("../../global").OrderServiceInit} param0
   */
  constructor({
    orderPricing = OrderService.DEFAULT_ORDER_PRICING,
    outputHandler = OrderService.DEFAULT_HANDLERS,
    logger = new Logger(),
    productRepository = new ProductRepository(),
    orderRepository = new OrderRepository(),
    notificationService = new NotificationService(),
  } = {}) {
    this.#productRepository = productRepository;
    this.#orderRepository = orderRepository;
    this.#notificationService = notificationService;
    this.#logger = logger;

    this.#pricing = orderPricing;
    this.#outputHandlers = outputHandler;
  }

  process(input) {
    const order = new OrderInput(input);

    this.#logger.info(`Iniciando processamento do pedido ${order.id}.`);

    for (const item of order.items) {
      const product = this.#productRepository.findById(item.product.id);

      if (!product) {
        throw new Error(`Produto ${item.product.id} nao encontrado.`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Estoque insuficiente para ${product.name}.`);
      }
    }

    this.#pricing.calc(order);
    const paymentStatus = this.#getPaymentStatus(order);

    for (const item of order.items) {
      this.#productRepository.updateStock(item.product.id, item.quantity);
    }

    order.setStatusFromPayment(paymentStatus);

    const orderSummary = new OrderSummary({
      order,
      pricing: this.#pricing,
    });

    this.#orderRepository.save(orderSummary);

    if (!this.#notificationService.notify(order.customer, orderSummary)) {
      this.#logger.warn(`Pedido ${order.id} aguardando pagamento.`);
    }

    this.#outputHandlers.forEach((handler) => handler.handle(orderSummary));

    return orderSummary;
  }

  #getPaymentStatus(order) {
    let paymentStatus = "pending";

    if (order.paymentMethod === "pix") {
      paymentStatus = "approved";
    } else if (order.paymentMethod === "credit_card") {
      paymentStatus = "approved";
    } else if (order.paymentMethod === "boleto") {
      paymentStatus = "waiting_payment";
    } else {
      throw new Error("Forma de pagamento invalida.");
    }

    return paymentStatus;
  }

  static get DEFAULT_ORDER_PRICING() {
    return new OrderPricing([
      new OrderTypeDiscountPricingItem(),
      new CouponCodeDiscountPricingItem(),
      new HighTicketDiscountPricingItem(),
      new FreightPricingItem(),
      new PaymentMethodPricingItem(),
    ]);
  }

  static get DEFAULT_HANDLERS() {
    return [new ConsolePrintOrder(), new JsonPrintOrder()];
  }
}

module.exports = OrderService;
