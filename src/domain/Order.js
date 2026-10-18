/**
 * @typedef {Object} OrderInputInit
 * @prop {string} id
 * @prop {OrderItem[]} items
 * @prop {"created"|"confirmed"} [status]
 * @prop {Date} [createdAt]
 */

class Order {
  constructor({ id, items, createdAt = new Date(), status = "created" }) {
    this.id = id;
    this.items = items;
    this.status = status;
    this.createdAt = createdAt;
  }
}

module.exports = Order;
