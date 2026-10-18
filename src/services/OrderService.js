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
const OrderPricingItem = require("../domain/pricing-item/OrderPricingItem");

class OrderService {
  #pricing;

  /**
   * @param {import("../../global").OrderServiceInit} param0
   */
  constructor({
    orderPricing = new OrderPricing([
      new OrderTypeDiscountPricingItem(),
      new CouponCodeDiscountPricingItem(),
      new HighTicketDiscountPricingItem(),
      new FreightPricingItem(),
      new PaymentMethodPricingItem(),
    ]),
  } = {}) {
    this.productRepository = new ProductRepository();
    this.orderRepository = new OrderRepository();
    this.notificationService = new NotificationService();
    this.logger = new Logger();

    this.#pricing = orderPricing;
  }

  process(input) {
    const order = new OrderInput(input);

    this.logger.info(`Iniciando processamento do pedido ${order.id}.`);

    for (const item of order.items) {
      const product = this.productRepository.findById(item.product.id);

      if (!product) {
        throw new Error(`Produto ${item.product.id} nao encontrado.`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Estoque insuficiente para ${product.name}.`);
      }
    }

    this.#pricing.calc(order);

    for (const item of order.items) {
      this.productRepository.updateStock(item.product.id, item.quantity);
    }

    order.setStatusFromPayment(this.#getPaymentStatus(order));

    const orderSummary = new OrderSummary({
      order,
      pricing: this.#pricing,
    });

    this.orderRepository.save(orderSummary);

    if (order.status === "confirmed") {
      this.notificationService.sendOrderConfirmation(
        order.customer,
        order.id,
        this.#pricing.total,
      );
    } else {
      this.logger.warn(`Pedido ${order.id} aguardando pagamento.`);
    }

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
}

module.exports = OrderService;
