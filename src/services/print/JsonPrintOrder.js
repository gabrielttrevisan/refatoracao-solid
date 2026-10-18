const PrintOrder = require("./PrintOrder");

class JsonPrintOrder extends PrintOrder {
  print(order) {
    console.log(JSON.stringify(order, null, 2));
  }

  static print(order) {
    new JsonPrintOrder().print(order);
  }
}

module.exports = JsonPrintOrder;
