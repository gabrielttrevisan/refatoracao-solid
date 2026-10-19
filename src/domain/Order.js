/**
 * @typedef {Object} OrderInputInit
 * @prop {string} id
 * @prop {import("./OrderItem").OrderItem[]} items
 * @prop {"created"|"confirmed"|"waiting_payment"} [status]
 * @prop {Date} [createdAt]
 */

class Order {
  /**
   * @param {OrderInputInit} param0
   */
  constructor({ id, items, createdAt = new Date(), status = "created" }) {
    this.id = id;
    this.items = items;
    this.status = status;
    this.createdAt = createdAt;
  }

  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + item.getSubtotal(), 0);
  }

  getTotalWeight() {
    return this.items.reduce((total, item) => {
      return total + item.product.weight * item.quantity;
    }, 0);
  }

  setStatusFromPayment(paymentStatus) {
    this.status =
      paymentStatus === "approved" ? "confirmed" : "waiting_payment";
  }

  isConfirmed() {
    return this.status === "confirmed";
  }
}

module.exports = Order;
