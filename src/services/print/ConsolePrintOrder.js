const Order = require("../../domain/OrderInput");
const PrintOrder = require("./PrintOrder");

class ConsolePrintOrder extends PrintOrder {
  print(order) {
    console.log("Resumo do pedido");
    console.log(`Cliente: ${order.customerName}`);
    console.log(`Cidade: ${order.city}/${order.state}`);
    console.log(`Itens: ${Order.prototype.getTotalItems.call(order)}`);
    console.log(`Subtotal: R$ ${order.subtotal.toFixed(2)}`);
    console.log(`Desconto: R$ ${order.discount.toFixed(2)}`);
    console.log(`Frete: R$ ${order.freight.toFixed(2)}`);
    console.log(`Taxas: R$ ${order.paymentFee.toFixed(2)}`);
    console.log(`Total: R$ ${order.total.toFixed(2)}`);
  }

  static print(order) {
    new ConsolePrintOrder().print(order);
  }
}

module.exports = ConsolePrintOrder;
