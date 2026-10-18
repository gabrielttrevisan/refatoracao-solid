const PrintOrder = require("./PrintOrder");

/** @implements {import("../../../global").IOutputHandler} */
class JsonPrintOrder extends PrintOrder {
  handle(order) {
    console.log(JSON.stringify(order, null, 2));
  }
}

module.exports = JsonPrintOrder;
