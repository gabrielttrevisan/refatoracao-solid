const Order = require("./Order");

/**
 * @typedef {Object} OrderSummaryInput
 * @prop {number} discount
 * @prop {number} subtotal
 * @prop {number} total
 * @prop {import("./OrderInput").OrderInput}
 * @prop {number} freight
 * @prop {number} paymentFee
 */

class OrderSummary extends Order {
  /**
   * @param {OrderSummaryInput} order
   */
  constructor({ order, discount, subtotal, total, freight, paymentFee }) {
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
    this.subtotal = subtotal;
    this.discount = Number(discount.toFixed(2));
    this.freight = Number(freight.toFixed(2));
    this.paymentFee = Number(paymentFee.toFixed(2));
    this.total = total;
    this.paymentMethod = order.paymentMethod;
  }
}

module.exports = OrderSummary;
