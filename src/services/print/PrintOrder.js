class PrintOrder {
  /**
   * @abstract
   * @param {import("../../domain/OrderInput").OrderInput} order
   */
  print(_order) {
    throw new Error("Not implemented yet");
  }
}

module.exports = PrintOrder;
