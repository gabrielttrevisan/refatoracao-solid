const OrderPricingItem = require("./OrderPricingItem");

class CouponCodeDiscountPricingItem extends OrderPricingItem {
  constructor() {
    super(OrderPricingItem.TYPE_DISCOUNT);
  }

  calc(order, subtotal) {
    if (order.couponCode === "TECH10") return subtotal * -0.1;

    return 0;
  }
}

module.exports = CouponCodeDiscountPricingItem;
