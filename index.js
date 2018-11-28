"use strict";

const bodyParser = require('body-parser'),
const config = require('config'),
const express = require('express'),
const http = require('http'),
const request = require('request');

var app = express();

app.set('port', process.env.PORT || 5555);
app.use(bodyParser.json());

const VALIDATION_TOKEN = "akadi";

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

app.listen(app.get('port'), function() {
  console.log('Bot is running on port ', app.get('port'));
});
app.post('/webhook/', function (req, res) {
  let message_events = req.body.entry[0].messaging
  for (message_event of message_events) {
      let sender = message_event.sender.id
      if (message_event.message && message_event.message.text) {
          let text = message_event.message.text
          sendTextMessage(sender, "J'ai recu : " + text.substring(0, 200))
      }
  }
  res.sendStatus(200)

  // Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});
