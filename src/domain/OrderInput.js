const Customer = require("./Customer");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const isNotStringField = require("../utils/string");
const isNotNumberField = require("../utils/number");

/**
 * @typedef {Object} OrderInputInit
 * @prop {string} id
 * @prop {Customer} customer
 * @prop {OrderItem[]} items
 * @prop {string} couponCode
 * @prop {string} paymentMethod
 * @prop {number} installments
 */

class OrderInput extends Order {
  /**
   * @param {OrderInputInit} order
   */
  constructor(order) {
    if (!order || typeof order !== "object")
      throw new Error("O pedido não pode ser vazio");

    if (isNotStringField(order, "id"))
      throw new Error("O ID do pedido deve ser string válida");

    if (!order.customer || !(order.customer instanceof Customer))
      throw new Error("O cliente não pode ser vazio ou inválido");

    if (
      !Array.isArray(order.items) ||
      !order.items.every((item) => item && item instanceof OrderItem)
    )
      throw new Error("Os itens do pedido não podem ser vazios ou inválidos");

    if (isNotStringField(order, "couponCode"))
      throw new Error("O código do cupom do pedido deve ser string válida");

    if (isNotStringField(order, "paymentMethod"))
      throw new Error("O meio de pagamento do pedido deve ser string válida");

    if (isNotNumberField(order, "installments") || order.installments <= 0)
      throw new Error("As parcelas do pedido devem ser menor ou igual a zero");

    if (order.createdAt && !(order.createdAt instanceof Date))
      throw new Error("Data de criação do pedido inválida");

    if (order.status && isNotStringField(order, "status"))
      throw new Error("O status do pedido deve ser string válida");

    const {
      id,
      customer,
      items,
      couponCode,
      paymentMethod,
      installments,
      createdAt = new Date(),
      status = "created",
    } = order;

    super({
      status: status,
      createdAt: createdAt,
      items: items,
      id: id,
    });

    this.customer = customer;
    this.couponCode = couponCode;
    this.paymentMethod = paymentMethod;
    this.installments = installments;
  }
}

module.exports = OrderInput;
