const isNotStringField = require("../utils/string");
const isNotNumberField = require("../utils/number");

/**
 * @typedef {Object} ProductInit
 * @prop {number} id
 * @prop {string} name
 * @prop {string} category
 * @prop {number} price
 * @prop {number} weight
 * @prop {number} stock
 */

class Product {
  /**
   * @param {ProductInit} product
   */
  constructor(product) {
    if (!product || typeof product !== "object")
      throw new Error("O produto não pode ser vazio");

    if (isNotStringField(product, "id"))
      throw new Error("O ID de um produto deve ser string");

    if (isNotStringField(product, "name"))
      throw new Error("O Nome do produto tem que ser uma string não vazia");

    if (isNotStringField(product, "category"))
      throw new Error("A categoria do produto tem que ser uma string não vazia");

    if (isNotNumberField(product, "weight") || product.weight <= 0)
      throw new Error("O peso de um produto deve ser numérico e maior que 0");

    if (isNotNumberField(product, "price") || product.price < 0)
      throw new Error("O preço de um produto deve ser numérico e menor que 0");

    if (isNotNumberField(product, "stock") || product.price < 0)
      throw new Error("O estoque de um produto deve ser numérico e menor que 0");

    const { id, name, category, price, weight, stock } = product;

    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.weight = weight;
    this.stock = stock;
  }
}

module.exports = Product;
