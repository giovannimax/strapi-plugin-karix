'use strict';

/**
 * Karix.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const Karix = require("karix-api");

module.exports = {
    sendSms: async (msg, recipient) => {
        var config = strapi.config.karix;

        var karix = new Karix({
            accountId: config.accountId,
            accountToken: config.accountToken,
            // This is optional
           host: process.env.KARIX_HOST || "https://api.karix.io/"
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
