const OrderPricingItem = require("./OrderPricingItem");

class OrderTypeDiscountPricingItem extends OrderPricingItem {
  constructor() {
    super(OrderPricingItem.TYPE_DISCOUNT);
  }

  calc(order, subtotal) {
    if (order.customer.type === "vip") return subtotal * -0.08;

    if (order.customer.type === "employee") return subtotal * -0.15;

    return 0;
  }
}

module.exports = OrderTypeDiscountPricingItem;
