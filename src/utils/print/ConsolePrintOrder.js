const Order = require("../../domain/OrderInput");
const PrintOrder = require("./PrintOrder");

/** @implements {import("../../../global").IOutputHandler} */
class ConsolePrintOrder extends PrintOrder {
  handle(order) {
    console.log("Resumo do pedido");
    console.log(`Cliente: ${order.customerName}`);
    console.log(`Cidade: ${order.city}/${order.state}`);
    console.log(`Itens: ${order.getTotalItems(order)}`);
    console.log(`Subtotal: R$ ${order.subtotal.toFixed(2)}`);
    console.log(`Desconto: R$ ${order.discount.toFixed(2)}`);
    console.log(`Frete: R$ ${order.freight.toFixed(2)}`);
    console.log(`Taxas: R$ ${order.paymentFee.toFixed(2)}`);
    console.log(`Total: R$ ${order.total.toFixed(2)}`);
  }
}

module.exports = ConsolePrintOrder;
