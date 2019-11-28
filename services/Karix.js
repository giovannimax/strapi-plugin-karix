'use strict';

/**
 * Karix.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const Karix = require("karix-api");

module.exports = {
    sendOrderSms: async(orderid) => {

        let order = await strapi.models.orders.findOne({ _id: orderid});

        let branch = await strapi.models.branches.findOne({branchId : order.meta.branch});
        let recipients = branch.contactNumbers || [];
        let sets = await strapi.models.settings.findOne({key: "app"});
        recipients.push(sets.value['admin-contact']);
        
        let orderType = order.meta.type === "pick-up" ? "PU" : "DEL";

        let orderPlace = order.meta.type === "pick-up" ? order.meta.branch : order.meta.address;

        let payment = order.meta.payment === "paymaya" || order.meta.payment === "CAD" ? "Paid via Paymaya" : order.meta.payment;

        var items = ``;

        order.items.forEach((el, idx) => {
            if(el.id !== "del-fee") {
                items = `${items} \n ${el.qty} ${el.name}`;
            }
        });

        let message = `New order from ${order.user.name} (${order.meta.phone}). ${orderType} ${order.meta.date} ${order.meta.time} at ${orderPlace}. ${payment} \n ${items}`;

        let sms = await strapi.plugins.karix.services.karix.sendSms(message, recipients);
        return sms;
    },
    sendSms: async (msg, recipient) => {
        var config = strapi.config.karix;

        var karix = new Karix({
            accountId: config.accountId,
            accountToken: config.accountToken,
            // This is optional
            host: config.host || "https://api.karix.io/"
        });

        var createSms = {
            "channel": "sms",
            "source": config.senderId,
            "destination": recipient,
            "content": {
            "text": msg,
            }
        }

        var sendSms = new Promise(function(resolve, reject) {
            karix.sendMessage(createSms,(error, response) => {
                if(error) {
                    return reject(error);
                } else {
                    return resolve(response);
                }
            });
        });

        var sms = null;
        try {
            sms = await sendSms;
        } catch(err) {
            console.log(err);
            return 'error';
        }

        return sms;
    }
        
};
