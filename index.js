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
