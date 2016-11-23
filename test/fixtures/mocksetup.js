var sinon = require('sinon');
var mongo = require('../../lib/util/mongo.js');
var mockMongo = sinon.mock(mongo);

module.exports = mockMongo;

