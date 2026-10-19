import { afterEach, describe, expect, it, vi } from "vitest";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const mainPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/main.js"
);

let main=require(mainPath);

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
    expect(consoleLog.mock.calls.map(([message]) => message)).toEqual([
      "[INFO] Iniciando processamento do pedido o1001.",
      "Resumo do pedido",
      "Cliente: Ana Souza",
      "Cidade: Presidente Prudente/SP",
      "Itens: 3",
      "Subtotal: R$ 6440.00",
      "Desconto: R$ 1159.20",
      "Frete: R$ 30.00",
      "Taxas: R$ 161.00",
      "Total: R$ 5471.80",
      JSON.stringify(result, null, 2)
    ]);
  });
});
