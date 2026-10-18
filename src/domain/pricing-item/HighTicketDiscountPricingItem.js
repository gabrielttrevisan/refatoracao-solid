const OrderPricingItem = require("./OrderPricingItem");

class HighTicketDiscountPricingItem extends OrderPricingItem {
  constructor() {
    super(OrderPricingItem.TYPE_DISCOUNT);
  }

  calc(_order, subtotal) {
    if (subtotal > 8000) return 250;

    return 0;
  }
}

module.exports = HighTicketDiscountPricingItem;
