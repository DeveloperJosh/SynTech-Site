var express = require('express');
const { format } = require('path');
const shop = express.Router();
const paypal = require('paypal-rest-sdk');
const { MessageEmbed, WebhookClient } = require('discord.js');
const EmailSchema = require('../../models/login');
const config = require('../config');

const webhookClient = new WebhookClient({ id: process.env.WEBHOOK_ID, token: process.env.WEBHOOK_TOKEN });
require('dotenv').config();

shop.use(express.static(__dirname + '.../public'));

function is_logged_in(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(403).send({ error: 'You are not logged in' });
    }
}

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.TESTING_PAYPAL_CLIENT_ID,
    'client_secret': process.env.TESTING_PAYPAL_CLIENT_SECRET
  });

shop.get('/', is_logged_in, function(req, res) {
    res.render('buy.html');
});

shop.post('/pay', (req, res) => {
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://syntech.lol/shop/success",
          "cancel_url": "http://syntech.lol/shop/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": "Premium Account",
                  "sku": "001",
                  "price": config.payment.price,
                  "currency": config.payment.currency,
                  "quantity": 1
              }]
          },
          "amount": {
              "currency": config.payment.currency,
              "total": config.payment.price
          },
          "description": "A premium account will get you 2000+ requests per 15 minutes and top tir support and a badge on your profile and discord name in the server."
      }]
};
  
paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
          }
        }
    }
  });
  
});

shop.get('/success', is_logged_in, (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": config.payment.currency,
              "total": config.payment.price
          }
    }]
};
  
paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
          console.log(error.response);
          throw error;
    } else {
          user = req.session.user
            EmailSchema.updateOne({
                id: user,
                premium: true
            }, function(err) {
                if (err) {
                    console.log(err);
                    res.send('Error');
                } else {
                    const embed = new MessageEmbed()
                    .setTitle('Account Upgrade')
                    .setDescription(`${user.username} has upgraded their account to premium!`)
                    .setThumbnail('https://www.iconpacks.net/icons/2/free-store-icon-1977-thumb.png')
                    .setColor('#0099ff');
                
                    webhookClient.send({
                    username: `${user.username}`,
                    avatarURL: 'https://www.iconpacks.net/icons/2/free-store-icon-1977-thumb.png',
                    embeds: [embed],
                    });
                    res.render('success.html')
                }
            }
        );
      }
  });
});

shop.get('/cancel', (req, res) => res.send('Cancelled'));

module.exports = shop;