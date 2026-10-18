const Order = require("./Order");
const OrderPricingItem = require("./pricing-item/OrderPricingItem");

/**
 * @typedef {Object} OrderSummaryInput
 * @prop {import("./OrderInput").OrderInput} order
 * @prop {import("./OrderPricing").OrderPricing} pricing
 */

class OrderSummary extends Order {
  /**
   * @param {OrderSummaryInput} order
   */
  constructor({ order, pricing }) {
    super({
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        subtotal: item.getSubtotal(),
      })),
      id: order.id,
    });

    this.customerName = order.customer.name;
    this.customerEmail = order.customer.email;
    this.city = order.customer.address.city;
    this.state = order.customer.address.state;
    this.discount = pricing.amount(OrderPricingItem.TYPE_DISCOUNT);
    this.subtotal = pricing.subtotal;
    this.total = pricing.total;
    this.freight = pricing.amount(OrderPricingItem.TYPE_FREIGHT);
    this.paymentFee = pricing.amount(OrderPricingItem.TYPE_FEE);
    this.paymentMethod = order.paymentMethod;
  }
}

module.exports = OrderSummary;
