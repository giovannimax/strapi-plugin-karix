'use strict';

/**
 * Karix.js controller
 *
 * @description: A set of functions called "actions" of the `karix` plugin.
 */

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.

    let msg = "Hi this is a sample text from myjoy.";
    let recipients = ["+639205140343"];

    let order = await strapi.models.orders.findOne({ _id: ctx.params.id});

    let orderType = order.meta.type === "pick-up" ? "PU" : "DEL";

    let orderPlace = order.meta.type === "pick-up" ? order.meta.branch : order.meta.address;

    let payment = order.meta.payment === "paypal" ? "Paid via Paypal" : "COD";

    var items = ``;

    order.items.forEach((el, idx) => {
    items = `${items} \n ${el.qty} ${el.name}`;
    });

    let message = `New order from ${order.user.name} (${order.meta.phone}). ${orderType} ${order.meta.date} ${order.meta.time} at ${orderPlace}. ${payment} \n ${items}`;

    let sms = await strapi.plugins.karix.services.karix.sendOrderSms(ctx.params.id);
  
    if(sms === 'error') {
      return ctx.send('error');
    }
    // Send 200 `ok`
    return ctx.send({
      message: sms
    });
  }
};
