const Address = require("./domain/Address");
const Customer = require("./domain/Customer");
const Order = require("./domain/OrderInput");
const OrderItem = require("./domain/OrderItem");
const OrderService = require("./services/OrderService");
const ProductRepository = require("./repositories/ProductRepository");
const productRepository = new ProductRepository();

module.exports = function main() {
  const customer = new Customer({
    id: "c1",
    name: "Ana Souza",
    email: "ana.souza@example.com",
    phone: "18999990000",
    type: "vip",
    address: new Address({
      street: "Rua das Palmeiras",
      number: "120",
      city: "Presidente Prudente",
      state: "SP",
      zipCode: "19000-000",
      region: "sudeste",
    }),
  });

  const notebook = productRepository.findById("p1");
  const mouse = productRepository.findById("p2");

  const order = new Order({
    id: "o1001",
    customer,
    items: [
      new OrderItem({ product: notebook, quantity: 1 }),
      new OrderItem({ product: mouse, quantity: 2 }),
    ],
    couponCode: "TECH10",
    paymentMethod: "credit_card",
    installments: 3,
  });

  const service = new OrderService();
  const result = service.process(order);

  return result;
};
