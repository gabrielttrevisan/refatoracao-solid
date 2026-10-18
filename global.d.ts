import OrderInput from "./src/domain/OrderInput";

export interface IAssertion<T> {
  assert(value: unknown): T;
}

export interface Calculus<T> {
  calc(input: T): number;
}

export class FreightCalculus implements Calculus<OrderInput> {
  calc(input: OrderInput): number;
}

type IOrderPricing = {
  get total(): number;
  get subtotal(): number;
  amount(type: string): number;
  calc(order: OrderInput): void;
};

export type OrderServiceInit = {
  orderPricing?: IOrderPricing;
};
