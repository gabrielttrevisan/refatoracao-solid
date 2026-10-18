const isNotStringField = require("../utils/string");
const Address = require("./Address");

/**
 * @typedef {Object} CustomerInit
 * @prop {string} id
 * @prop {string} name
 * @prop {string} email
 * @prop {string} phone
 * @prop {"vip"|"employee"} type
 * @prop {import("./Address").Address} address
 */

class Customer {
  /**
   * @param {CustomerInit} customer
   */
  constructor(customer) {
    if (isNotStringField(customer, "id"))
      throw new Error("ID do cliente inválido.");

    if (isNotStringField(customer, "email") || !customer.email.includes("@"))
      throw new Error("E-mail do cliente inválido.");

    if (isNotStringField(customer, "type"))
      throw new Error("Tipo do cliente inválido.");

    if (isNotStringField(customer, "name"))
      throw new Error("Nome do cliente inválido.");

    if (isNotStringField(customer, "phone"))
      throw new Error("Telefone do cliente inválido.");

    if (!(customer.address instanceof Address))
      throw new Error("Endereço do cliente inválido.");

    const { id, name, email, phone, type, address } = customer;

    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.type = type;
    this.address = address;
  }
}

module.exports = Customer;
