const OrderInput = require("../domain/OrderInput");

/** @implements {import("../../global").IOrderNotificationService} */
class NotificationService {
  notify(_customer, orderSummary) {
    if (orderSummary.isConfirmed()) {
      // notifica o cliente
      return true;
    }

    return false;
  }
}

module.exports = NotificationService;
