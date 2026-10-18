class OrderPricingItem {
  static get TYPE_FEE() {
    return "fee";
  }

  static get TYPE_DISCOUNT() {
    return "discount";
  }

  static get TYPE_FREIGHT() {
    return "freight";
  }

  #type;

  constructor(type) {
    this.#type = type;
  }

  get type() {
    return this.#type;
  }

  set type(type) {
    this.#type = type;
  }

  /**
   *
   * @param {import("../../../domain/OrderInput").OrderInput} _order
   * @param {number} subtotal
   * @returns {number}
   */
  calc(_order, subtotal) {
    throw new Error("Not implement yet");
  }
}

module.exports = OrderPricingItem;
