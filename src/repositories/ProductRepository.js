const Product = require("../domain/Product");

/** @implements {import("../../global").IProductRepository} */
class ProductRepository {
  constructor() {
    this.products = [
      new Product({
        id: "p1",
        name: "Notebook Pro 14",
        category: "notebook",
        price: 6200,
        weight: 2.1,
        stock: 8,
      }),
      new Product({
        id: "p2",
        name: "Mouse Sem Fio",
        category: "peripheral",
        price: 120,
        weight: 0.2,
        stock: 30,
      }),
      new Product({
        id: "p3",
        name: "Monitor 27",
        category: "monitor",
        price: 1450,
        weight: 5.4,
        stock: 12,
      }),
      new Product({
        id: "p4",
        name: "Teclado Mecanico",
        category: "peripheral",
        price: 380,
        weight: 0.9,
        stock: 15,
      }),
    ];
  }

  findById(id) {
    return this.products.find((product) => product.id === id);
  }

  updateStock(productId, quantity) {
    const product = this.findById(productId);

    if (!product) {
      throw new Error("Produto nao encontrado.");
    }

    product.stock -= quantity;
    return product;
  }

  findAll() {
    return this.products;
  }
}

module.exports = ProductRepository;
