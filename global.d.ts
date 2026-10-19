import Customer from "./src/domain/Customer";
import Order from "./src/domain/Order";
import OrderInput from "./src/domain/OrderInput";
import OrderSummary from "./src/domain/OrderSummary";
import Product from "./src/domain/Product";

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

interface IOutputHandler {
  handle(orderSummary: OrderSummary): void;
}

interface ILogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

interface IRepository<T> {
  findById(id: string): T | undefined;
  findAll(): T[];
}

interface IProductRepository extends IRepository<Product> {
  updateStock(id: string, quantity: number): Product;
}

interface IOrderRepository extends IRepository<OrderSummary> {
  save(orderSummary: OrderSummary): void;
}

interface IOrderNotificationService {
  notify(customer: Customer, orderSummary: OrderSummary): boolean;
}

export type OrderServiceInit = {
  orderPricing?: IOrderPricing;
  outputHandler?: IOutputHandler[];
  logger?: ILogger;
  productReposity?: IProductRepository;
  orderRepository?: IOrderRepository;
  notificationService?: IOrderNotificationService;
};
