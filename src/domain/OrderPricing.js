const OrderInput = require("./OrderInput");
const OrderPricingItem = require("./pricing-item/OrderPricingItem");

class OrderPricing {
  #subtotal = 0;
  #total = 0;
  #items = [];
  #amountByType;

  /**
   * @param {OrderPricingItem[]}
   */
  constructor(pricingItems) {
    this.#items = pricingItems;
  }

  /**
   * @param {OrderInput} order
   */
  calc(order) {
    this.#subtotal = order.getSubtotal();
    this.#total = this.#subtotal;
    this.#amountByType = new Map();

    for (const item of this.#items) {
      const amount = item.calc(order, this.#subtotal);
      const currentAmount = this.#amountByType.get(item.type) ?? 0;

      this.#amountByType.set(item.type, currentAmount + amount);
      this.#total += amount;
    }

    if (this.#total <= 0) {
      throw new Error("Total do pedido invalido.");
    }
  }

  get subtotal() {
    return this.#subtotal;
  }

  get total() {
    return this.#total;
  }

  amount(type) {
    return Math.abs(this.#amountByType.get(type) ?? 0);
  }
}

module.exports = OrderPricing;
