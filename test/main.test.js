import { afterEach, describe, expect, it, vi } from "vitest";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const mainPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/main.js"
);
const orderServicePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/services/OrderService.js"
);
const originalLoad = Module._load;

class NotificationServiceStub {
  sendOrderConfirmation() {}
}

Module._load = function (request, parent, isMain) {
  if (parent && parent.filename === orderServicePath && request === "./NotificationService") {
    return NotificationServiceStub;
  }

  return originalLoad.call(this, request, parent, isMain);
};

let main;
try {
  main = require(mainPath);
} finally {
  Module._load = originalLoad;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("main", () => {
  it("retorna o resumo esperado e exibe os detalhes do pedido", () => {
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = main();

    expect(result).toMatchObject({
      id: "o1001",
      customerName: "Ana Souza",
      customerEmail: "ana.souza@example.com",
      city: "Presidente Prudente",
      state: "SP",
      items: [
        {
          productId: "p1",
          name: "Notebook Pro 14",
          quantity: 1,
          subtotal: 6200
        },
        {
          productId: "p2",
          name: "Mouse Sem Fio",
          quantity: 2,
          subtotal: 240
        }
      ],
      subtotal: 6440,
      discount: 1159.2,
      freight: 30,
      paymentFee: 161,
      total: 5471.8,
      paymentMethod: "credit_card",
      status: "confirmed"
    });
    expect(result.createdAt).toBeInstanceOf(Date);
  });
});
