/** @implements {import("../../../global").IOutputHandler} */
class PrintOrder {
  /**
   * @abstract
   * @param {import("../../domain/OrderSummary").OrderSummary} order
   */
  handle(_order) {
    throw new Error("Not implemented yet");
  }
}

module.exports = PrintOrder;
