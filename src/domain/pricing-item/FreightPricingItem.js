const OrderPricingItem = require("./OrderPricingItem");

class FreightPricingItem extends OrderPricingItem {
  constructor() {
    super(OrderPricingItem.TYPE_FREIGHT);
  }

  calc(order) {
    let totalWeight = order.getTotalWeight();

    let freight = 0;

    if (order.customer.address.region === "sudeste") {
      freight = 20 + totalWeight * 4;
    } else if (order.customer.address.region === "sul") {
      freight = 28 + totalWeight * 5;
    } else if (order.customer.address.region === "centro-oeste") {
      freight = 35 + totalWeight * 6;
    } else if (order.customer.address.region === "nordeste") {
      freight = 45 + totalWeight * 7;
    } else if (order.customer.address.region === "norte") {
      freight = 60 + totalWeight * 9;
    } else {
      freight = 50 + totalWeight * 8;
    }

    if (order.couponCode === "FRETEGRATIS") {
      freight = 0;
    }

    return freight;
  }
}

module.exports = FreightPricingItem;
