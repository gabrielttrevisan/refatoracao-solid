const isNotStringField = require("../utils/string");

/**
 * @typedef {Object} AddressInit
 * @prop {string} street
 * @prop {string} number
 * @prop {string} city
 * @prop {string} state
 * @prop {string} zipCode
 * @prop {string} region
 */

class Address {
  /**
   * @param {AddressInit} address
   */
  constructor(address) {
    if (!address) throw new Error("Cliente obrigatório.");

    if (isNotStringField(address, "state"))
      throw new Error("O endereço deve conter o estado");

    if (isNotStringField(address, "city"))
      throw new Error("O endereço deve conter a cidade");

    if (isNotStringField(address, "region"))
      throw new Error("O endereço deve conter a região");

    const { street, number, city, state, zipCode, region } = address;

    this.street = street;
    this.number = number;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
    this.region = region;
  }
}

module.exports = Address;
