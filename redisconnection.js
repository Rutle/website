'use strict';

const aDetails = require('./auth')
var redis = require('redis');

var redisClient = redis.createClient(aDetails.aPort, aDetails.aHost, {no_ready_check: true});
redisClient.auth(aDetails.aPassword, function (err) {
    if (err) throw err;
});

redisClient.on('connect', function() {
    console.log('Connected to Redis');
});

module.exports.redisClient = redisClient;
