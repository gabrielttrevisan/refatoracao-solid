const OrderPricingItem = require("./OrderPricingItem");

class PaymentMethodPricingItem extends OrderPricingItem {
  constructor() {
    super(OrderPricingItem.TYPE_DISCOUNT);
  }

  calc(order, subtotal) {
    if (order.paymentMethod === "pix") return subtotal * -0.03;

    if (order.paymentMethod === "credit_card" && order.installments > 1) {
      this.type = OrderPricingItem.TYPE_FEE;
      return subtotal * 0.025;
    }

    return 0;
  }
}

module.exports = PaymentMethodPricingItem;
