const isNotNumberField = require("../utils/number");
const Product = require("./Product");

/**
 * @typedef {Object} OrderItemInit
 * @prop {Product} product
 * @prop {number} quantity
 */

class OrderItem {
  /**
   * @param {OrderItemInit} item
   */
  constructor(item) {
    if (!item || typeof item !== "object")
      throw new Error("O item não pode ser vazio");

    if (isNotNumberField(item, "quantity") || item.quantity <= 0)
      throw new Error(
        "A quantidade de um item deve ser numérica e maior que 0",
      );

    if (!(item.product instanceof Product))
      throw new Error("O produto deve ser do tipo esperado");

    const { product, quantity } = item;

    this.product = product;
    this.quantity = quantity;
  }

  getSubtotal() {
    return this.product.price * this.quantity;
  }
}

module.exports = OrderItem;
