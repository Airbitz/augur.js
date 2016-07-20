/**
 * augur.js tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var fs = require("fs");
var join = require("path").join;
var assert = require("chai").assert;
var async = require("async");
var abi = require("augur-abi");
var chalk = require("chalk");
var augurpath = "../../src/index";
var augur = require(augurpath);
var tools = require("../tools");
var random = require("../random");

describe("Unit tests", function () {

	describe("getTradingActions", function () {
		var txOriginal;
		before("getTradingActions", function () {
			txOriginal = augur.tx;
			augur.tx = new require('augur-contracts').Tx("2").functions;
		});

		after("getTradingActions", function () {
			augur.tx = txOriginal;
		});

		describe("buy actions", function () {
			runTestCase({
				description: "no asks",
				type: "buy",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "0",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 1);
					var expected = [{
						"action": "BID",
						"shares": "5",
						"gasEth": "0.0627",
						"feeEth": "0.03",
						"costEth": "3",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "no suitable asks",
				type: "buy",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "0",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [],
					sell: [
						{
							id: "order1",
							type: "sell",
							amount: "5",
							price: "0.7", // price too high
							outcome: "outcomeasdf123"
						},
						{
							id: "order2",
							owner: "abcd1234", // user's ask
							type: "sell",
							amount: "5",
							price: "0.6",
							outcome: "outcomeasdf123"
						},
						{
							id: "order3",
							type: "sell",
							amount: "5",
							price: "0.6",
							outcome: "differentOutcome" // different outcome
						}
					]
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 1);
					var expected = [{
						"action": "BID",
						"shares": "5",
						"gasEth": "0.0627",
						"feeEth": "0.03",
						"costEth": "3",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "ask with same shares and price",
				type: "buy",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "0",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [],
					sell: [{
						id: "order1",
						type: "sell",
						amount: "5",
						price: "0.6",
						outcome: "outcomeasdf123"
					}]
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 1);
					var expected = [{
						"action": "BUY",
						"shares": "5",
						"gasEth": "0.0627",
						"feeEth": "0.06",
						"costEth": "3",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "ask with less shares and same price",
				type: "buy",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "0",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [],
					sell: [{
						id: "order1",
						type: "sell",
						amount: "2",
						price: "0.6",
						outcome: "outcomeasdf123"
					}]
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 2);
					var expected = [{
						"action": "BUY",
						"shares": "2",
						"gasEth": "0.0627",
						"feeEth": "0.024",
						"costEth": "1.2",
						"avgPrice": "0.6"
					}, {
						"action": "BID",
						"shares": "3",
						"gasEth": "0.0627",
						"feeEth": "0.018",
						"costEth": "1.8",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "ask with same shares and lower price",
				type: "buy",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "0",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [],
					sell: [{
						id: "order1",
						type: "sell",
						amount: "5",
						price: "0.4",
						outcome: "outcomeasdf123"
					}]
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 1);
					var expected = [{
						"action": "BUY",
						"shares": "5",
						"gasEth": "0.0627",
						"feeEth": "0.04",
						"costEth": "2",
						"avgPrice": "0.4"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "ask with less shares and lower price",
				type: "buy",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "0",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [],
					sell: [{
						id: "order1",
						type: "sell",
						amount: "2",
						price: "0.4",
						outcome: "outcomeasdf123"
					}]
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 2);
					var expected = [{
						"action": "BUY",
						"shares": "2",
						"gasEth": "0.0627",
						"feeEth": "0.016",
						"costEth": "0.8",
						"avgPrice": "0.4"
					}, {
						"action": "BID",
						"shares": "3",
						"gasEth": "0.0627",
						"feeEth": "0.018",
						"costEth": "1.8",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "asks with same shares and lower prices",
				type: "buy",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "0",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [],
					sell: [{
						id: "order1",
						type: "sell",
						amount: "1",
						price: "0.4",
						outcome: "outcomeasdf123"
					}, {
						id: "order2",
						type: "sell",
						amount: "2",
						price: "0.3",
						outcome: "outcomeasdf123"
					}, {
						id: "order3",
						type: "sell",
						amount: "2",
						price: "0.2",
						outcome: "outcomeasdf123"
					}]
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 1);
					var expected = [{
						"action": "BUY",
						"shares": "5",
						"gasEth": "0.0627",
						"feeEth": "0.028",
						"costEth": "1.4",
						"avgPrice": "0.28"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "asks with less shares and lower price",
				type: "buy",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "0",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [],
					sell: [{
						id: "order1",
						type: "sell",
						amount: "1",
						price: "0.4",
						outcome: "outcomeasdf123"
					}, {
						id: "order2",
						type: "sell",
						amount: "2",
						price: "0.3",
						outcome: "outcomeasdf123"
					}]
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 2);
					var expected = [{
						"action": "BUY",
						"shares": "3",
						"gasEth": "0.0627",
						"feeEth": "0.02",
						"costEth": "1",
						"avgPrice": "0.33333333333333333333"
					}, {
						"action": "BID",
						"shares": "2",
						"gasEth": "0.0627",
						"feeEth": "0.012",
						"costEth": "1.2",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});
		});

		describe("sell actions", function () {
			runTestCase({
				description: "no bids, no position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "0",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 1);
					var expected = [{
						"action": "SHORT_SELL_RISKY",
						"shares": "5",
						"gasEth": "0.1254",
						"feeEth": "0.03",
						"costEth": "3",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bid with same shares and prices, no position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "0",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "5",
						price: "0.6",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 1);
					var expected = [{
						"action": "SHORT_SELL",
						"shares": "5",
						"gasEth": "0.0627",
						"feeEth": "0.06",
						"costEth": "3",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bid with less amount and same price, no position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "0",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "2",
						price: "0.6",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 2);
					var expected = [{
						"action": "SHORT_SELL",
						"shares": "2",
						"gasEth": "0.0627",
						"feeEth": "0.024",
						"costEth": "1.2",
						"avgPrice": "0.6"
					}, {
						"action": "SHORT_SELL_RISKY",
						"shares": "3",
						"gasEth": "0.1254",
						"feeEth": "0.018",
						"costEth": "1.8",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bid with same shares and higher price, no position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "0",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "5",
						price: "0.7",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 1);
					var expected = [{
						"action": "SHORT_SELL",
						"shares": "5",
						"gasEth": "0.0627",
						"feeEth": "0.07",
						"costEth": "3.5",
						"avgPrice": "0.7"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bid with less shares and higher price, no position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "0",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "2",
						price: "0.7",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 2);
					var expected = [{
						"action": "SHORT_SELL",
						"shares": "2",
						"gasEth": "0.0627",
						"feeEth": "0.028",
						"costEth": "1.4",
						"avgPrice": "0.7"
					}, {
						"action": "SHORT_SELL_RISKY",
						"shares": "3",
						"gasEth": "0.1254",
						"feeEth": "0.018",
						"costEth": "1.8",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bids with less shares and higher prices, no position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "0",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "1",
						price: "0.7",
						outcome: "outcomeasdf123"
					}, {
						id: "order1",
						type: "buy",
						amount: "2",
						price: "0.8",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 2);
					var expected = [{
						"action": "SHORT_SELL",
						"shares": "3",
						"gasEth": "0.0627",
						"feeEth": "0.046",
						"costEth": "2.3",
						"avgPrice": "0.76666666666666666667"
					}, {
						"action": "SHORT_SELL_RISKY",
						"shares": "2",
						"gasEth": "0.1254",
						"feeEth": "0.012",
						"costEth": "1.2",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bids with same shares and higher prices, no position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "0",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "1",
						price: "0.7",
						outcome: "outcomeasdf123"
					}, {
						id: "order1",
						type: "buy",
						amount: "2",
						price: "0.8",
						outcome: "outcomeasdf123"
					}, {
						id: "order1",
						type: "buy",
						amount: "2",
						price: "0.9",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 1);
					var expected = [{
						"action": "SHORT_SELL",
						"shares": "5",
						"gasEth": "0.0627",
						"feeEth": "0.082",
						"costEth": "4.1",
						"avgPrice": "0.82"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "no bids, smaller position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "2",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 2);
					var expected = [{
						"action": "ASK",
						"shares": "2",
						"gasEth": "0.0627",
						"feeEth": "0.012",
						"costEth": "1.2",
						"avgPrice": "0.6"
					}, {
						"action": "SHORT_SELL_RISKY",
						"shares": "3",
						"gasEth": "0.1254",
						"feeEth": "0.018",
						"costEth": "1.8",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bid with same shares and price, smaller position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "2",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "5",
						price: "0.6",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 2);
					var expected = [{
						"action": "SELL",
						"shares": "2",
						"gasEth": "0.0627",
						"feeEth": "0.024",
						"costEth": "1.2",
						"avgPrice": "0.6"
					}, {
						"action": "SHORT_SELL",
						"shares": "3",
						"gasEth": "0.0627",
						"feeEth": "0.036",
						"costEth": "1.8",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bid with less shares and same price, smaller position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "2",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "2",
						price: "0.6",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 2);
					var expected = [{
						"action": "SELL",
						"shares": "2",
						"gasEth": "0.0627",
						"feeEth": "0.024",
						"costEth": "1.2",
						"avgPrice": "0.6"
					}, {
						"action": "SHORT_SELL_RISKY",
						"shares": "3",
						"gasEth": "0.1254",
						"feeEth": "0.018",
						"costEth": "1.8",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bid with same shares and higher price, smaller position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "2",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "5",
						price: "0.7",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 2);
					var expected = [{
						"action": "SELL",
						"shares": "2",
						"gasEth": "0.0627",
						"feeEth": "0.028",
						"costEth": "1.4",
						"avgPrice": "0.7"
					}, {
						"action": "SHORT_SELL",
						"shares": "3",
						"gasEth": "0.0627",
						"feeEth": "0.042",
						"costEth": "2.1",
						"avgPrice": "0.7"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bid with less shares and higher price, smaller position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "2",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "2",
						price: "0.7",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 2);
					var expected = [{
						"action": "SELL",
						"shares": "2",
						"gasEth": "0.0627",
						"feeEth": "0.028",
						"costEth": "1.4",
						"avgPrice": "0.7"
					}, {
						"action": "SHORT_SELL_RISKY",
						"shares": "3",
						"gasEth": "0.1254",
						"feeEth": "0.018",
						"costEth": "1.8",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bids with less shares and higher prices, smaller position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "2",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "1",
						price: "0.7",
						outcome: "outcomeasdf123"
					}, {
						id: "order2",
						type: "buy",
						amount: "2",
						price: "0.8",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 3);
					var expected = [{
						"action": "SELL",
						"shares": "2",
						"gasEth": "0.0627",
						"feeEth": "0.032",
						"costEth": "1.6",
						"avgPrice": "0.8"
					}, {
						"action": "SHORT_SELL",
						"shares": "1",
						"gasEth": "0.0627",
						"feeEth": "0.014",
						"costEth": "0.7",
						"avgPrice": "0.7"
					}, {
						"action": "SHORT_SELL_RISKY",
						"shares": "2",
						"gasEth": "0.1254",
						"feeEth": "0.012",
						"costEth": "1.2",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bids with same shares and higher prices, smaller position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "2",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "1",
						price: "0.7",
						outcome: "outcomeasdf123"
					}, {
						id: "order2",
						type: "buy",
						amount: "2",
						price: "0.8",
						outcome: "outcomeasdf123"
					}, {
						id: "order3",
						type: "buy",
						amount: "2",
						price: "0.9",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 2);
					var expected = [{
						"action": "SELL",
						"shares": "2",
						"gasEth": "0.0627",
						"feeEth": "0.036",
						"costEth": "1.8",
						"avgPrice": "0.9"
					}, {
						"action": "SHORT_SELL",
						"shares": "3",
						"gasEth": "0.0627",
						"feeEth": "0.046",
						"costEth": "2.3",
						"avgPrice": "0.76666666666666666667"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "no bids, same position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "5",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 1);
					var expected = [{
						"action": "ASK",
						"shares": "5",
						"gasEth": "0.0627",
						"feeEth": "0.03",
						"costEth": "3",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bid with same shares and price, same position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "5",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "5",
						price: "0.6",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 1);
					var expected = [{
						"action": "SELL",
						"shares": "5",
						"gasEth": "0.0627",
						"feeEth": "0.06",
						"costEth": "3",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bid with less shares and same price, same position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "5",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "2",
						price: "0.6",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 2);
					var expected = [{
						"action": "SELL",
						"shares": "2",
						"gasEth": "0.0627",
						"feeEth": "0.024",
						"costEth": "1.2",
						"avgPrice": "0.6"
					}, {
						"action": "ASK",
						"shares": "3",
						"gasEth": "0.0627",
						"feeEth": "0.018",
						"costEth": "1.8",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bid with same shares and higher price, same position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "5",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "5",
						price: "0.7",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 1);
					var expected = [{
						"action": "SELL",
						"shares": "5",
						"gasEth": "0.0627",
						"feeEth": "0.07",
						"costEth": "3.5",
						"avgPrice": "0.7"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bid with less shares and higher price, same position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "5",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "2",
						price: "0.7",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 2);
					var expected = [{
						"action": "SELL",
						"shares": "2",
						"gasEth": "0.0627",
						"feeEth": "0.028",
						"costEth": "1.4",
						"avgPrice": "0.7"
					}, {
						"action": "ASK",
						"shares": "3",
						"gasEth": "0.0627",
						"feeEth": "0.018",
						"costEth": "1.8",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bids with less shares and higher prices, same position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "5",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "1",
						price: "0.7",
						outcome: "outcomeasdf123"
					}, {
						id: "order2",
						type: "buy",
						amount: "2",
						price: "0.8",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 2);
					var expected = [{
						"action": "SELL",
						"shares": "3",
						"gasEth": "0.0627",
						"feeEth": "0.046",
						"costEth": "2.3",
						"avgPrice": "0.76666666666666666667"
					}, {
						"action": "ASK",
						"shares": "2",
						"gasEth": "0.0627",
						"feeEth": "0.012",
						"costEth": "1.2",
						"avgPrice": "0.6"
					}];
					assert.deepEqual(actions, expected)
				}
			});

			runTestCase({
				description: "bids with same shares and higher prices, same position",
				type: "sell",
				orderShares: "5",
				orderLimitPrice: "0.6",
				takerFee: "0.02",
				makerFee: "0.01",
				userPositionShares: "5",
				outcomeId: "outcomeasdf123",
				marketOrderBook: {
					buy: [{
						id: "order1",
						type: "buy",
						amount: "1",
						price: "0.7",
						outcome: "outcomeasdf123"
					}, {
						id: "order2",
						type: "buy",
						amount: "2",
						price: "0.8",
						outcome: "outcomeasdf123"
					}, {
						id: "order3",
						type: "buy",
						amount: "2",
						price: "0.9",
						outcome: "outcomeasdf123"
					}],
					sell: []
				},
				userAddress: "abcd1234",
				assertions: function (actions) {
					assert.isArray(actions);
					assert.lengthOf(actions, 1);
					var expected = [{
						"action": "SELL",
						"shares": "5",
						"gasEth": "0.0627",
						"feeEth": "0.082",
						"costEth": "4.1",
						"avgPrice": "0.82"
					}];
					assert.deepEqual(actions, expected)
				}
			});
		});

		function runTestCase(testCase) {
			it(testCase.description, function () {
				var actions = augur.getTradingActions({
					type: testCase.type,
					orderShares: testCase.orderShares,
					orderLimitPrice: testCase.orderLimitPrice,
					takerFee: testCase.takerFee,
					makerFee: testCase.makerFee,
					userAddress: testCase.userAddress,
					userPositionShares: testCase.userPositionShares,
					outcomeId: testCase.outcomeId,
					marketOrderBook: testCase.marketOrderBook
				});
				testCase.assertions(actions);
			});
		}
	});

    describe("processOrder", function () {

        var buy, sell, trade, short_sell, buyCompleteSets;

        var requests = {};
        var unexpectedEvents = {
            onBuySellSuccess: function (requestId, res) {
                requests[requestId].done(new Error("unexpected buy/sell"));
            },
            onTradeSuccess: function (requestId, res) {
                requests[requestId].done(new Error("unexpected trade/short_sell"));
            },
            onBuyCompleteSetsSuccess: function (requestId, res) {
                requests[requestId].done(new Error("unexpected buyCompleteSets"));
            },
            onCommitFailed: function (requestId, err) {
                requests[requestId].done(new Error(JSON.stringify(err)));
            },
            onBuySellFailed: function (requestId, err) {
                requests[requestId].done(new Error(JSON.stringify(err)));
            },
            onTradeFailed: function (requestId, err) {
                requests[requestId].done(new Error(JSON.stringify(err)));
            },
            onBuyCompleteSetsFailed: function (requestId, err) {
                requests[requestId].done(new Error(JSON.stringify(err)));
            }
        };

        before("processOrder", function () {
            buy = augur.buy;
            sell = augur.sell;
            trade = augur.trade;
            short_sell = augur.short_sell;
            buyCompleteSets = augur.buyCompleteSets;
        });

        after("processOrder", function () {
            assert.strictEqual(Object.keys(requests).length, 0);
            augur.buy = buy;
            augur.sell = sell;
            augur.trade = trade;
            augur.short_sell = short_sell;
            augur.buyCompleteSets = buyCompleteSets;
        });

        var test = function (t) {
            it(JSON.stringify(t), function (done) {
                this.timeout(tools.TIMEOUT);
                requests[t.requestId] = {done: done};
                augur.buy = function (p) {
                    assert(p.amount);
                    assert(p.price);
                    assert(p.market);
                    assert(p.outcome);
                    assert.isFunction(p.onSent);
                    assert.isFunction(p.onSuccess);
                    assert.isFunction(p.onFailed);
                    p.onSuccess({callReturn: "1"});
                };
                augur.sell = function (p) {
                    assert(p.amount);
                    assert(p.price);
                    assert(p.market);
                    assert(p.outcome);
                    assert.isFunction(p.onSent);
                    assert.isFunction(p.onSuccess);
                    assert.isFunction(p.onFailed);
                    p.onSuccess({callReturn: "1"});
                };
                augur.trade = function (p) {
                    assert.property(p, "max_value");
                    assert.property(p, "max_amount");
                    assert.isArray(p.trade_ids);
                    assert.isFunction(p.onTradeHash);
                    assert.isFunction(p.onCommitSent);
                    assert.isFunction(p.onCommitSuccess);
                    assert.isFunction(p.onCommitFailed);
                    assert.isFunction(p.onNextBlock);
                    assert.isFunction(p.onTradeSent);
                    assert.isFunction(p.onTradeSuccess);
                    assert.isFunction(p.onTradeFailed);
                    p.onTradeSuccess({callReturn: [, t.etherNotFilled || "0", t.sharesNotSold || "0"]});
                };
                augur.short_sell = function (p) {
                    assert(p.buyer_trade_id);
                    assert.property(p, "max_amount");
                    assert.isFunction(p.onTradeHash);
                    assert.isFunction(p.onCommitSent);
                    assert.isFunction(p.onCommitSuccess);
                    assert.isFunction(p.onCommitFailed);
                    assert.isFunction(p.onNextBlock);
                    assert.isFunction(p.onTradeSent);
                    assert.isFunction(p.onTradeSuccess);
                    assert.isFunction(p.onTradeFailed);
                    var index = requests[t.requestId].shortSellCount || 0;
                    var sharesLeft = abi.bignum(p.max_amount).minus(abi.bignum(t.marketOrderBook.buy[index].amount)).toFixed();
                    p.onTradeSuccess({callReturn: [, sharesLeft]});
                };
                augur.buyCompleteSets = function (p) {
                    assert(p.market);
                    assert(p.amount);
                    assert.isFunction(p.onSent);
                    assert.isFunction(p.onSuccess);
                    assert.isFunction(p.onFailed);
                    p.onSuccess({callReturn: "1"});
                };
                var value = abi.bignum(t.amount).times(abi.bignum(t.limitPrice)).toFixed();
                augur.processOrder({
                    requestId: t.requestId,
                    market: t.market,
                    marketOrderBook: t.marketOrderBook,
                    userTradeOrder: {
                        type: t.type,
                        sharesToSell: t.amount,
                        etherToBuy: value,
                        limitPrice: t.limitPrice,
                        outcomeID: t.outcome
                    },
                    userPosition: t.userPosition,
                    onTradeHash: t.onTradeHash,
                    onCommitSent: t.onCommitSent,
                    onCommitFailed: t.onCommitFailed || unexpectedEvents.onCommitFailed,
                    onNextBlock: t.onNextBlock,
                    onTradeSent: t.onTradeSent,
                    onTradeSuccess: t.onTradeSuccess || unexpectedEvents.onTradeSuccess,
                    onTradeFailed: t.onTradeFailed || unexpectedEvents.onTradeFailed,
                    onBuySellSent: t.onBuySellSent,
                    onBuySellSuccess: t.onBuySellSuccess || unexpectedEvents.onBuySellSuccess,
                    onBuySellFailed: t.onBuySellFailed || unexpectedEvents.onBuySellFailed,
                    onBuyCompleteSetsSent: t.onBuyCompleteSetsSent,
                    onBuyCompleteSetsSuccess: t.onBuyCompleteSetsSuccess || unexpectedEvents.onBuyCompleteSetsSuccess,
                    onBuyCompleteSetsFailed: t.onBuyCompleteSetsFailed || unexpectedEvents.onBuyCompleteSetsFailed
                });
            });
        };

        // buy order: create buy order for outcome 1
        test({
            requestId: 1,
            market: "0xdeadbeef",
            amount: 1,
            outcome: "1",
            limitPrice: "0.6",
            type: "buy",
            marketOrderBook: {buy: [], sell: []},
            userPosition: {qtyShares: 0},
            onBuySellSuccess: function (requestId, res) {
                requests[requestId].done();
                delete requests[requestId];
            }
        });

        // buy order: create buy order for outcome 2
        test({
            requestId: 2,
            market: "0xdeadbeef",
            amount: 1,
            outcome: "2",
            limitPrice: "0.6",
            type: "buy",
            marketOrderBook: {buy: [], sell: []},
            userPosition: {qtyShares: 0},
            onBuySellSuccess: function (requestId, res) {
                requests[requestId].done();
                delete requests[requestId];
            }
        });

        // buy order: match existing sell order exactly
        test({
            requestId: 3,
            market: "0xdeadbeef",
            amount: 1,
            outcome: "1",
            limitPrice: "0.9",
            type: "buy",
            marketOrderBook: {
                buy: [],
                sell: [{
                    id: "0x123456789abcdef",
                    type: "sell",
                    market: "0xdeadbeef",
                    amount: "1",
                    price: "0.9",
                    owner: "0x0000000000000000000000000000000000001337",
                    block: 1117314,
                    outcome: "1"
                }]
            },
            userPosition: {qtyShares: 0},
            onTradeSuccess: function (requestId, res) {
                requests[requestId].done();
                delete requests[requestId];
            }
        });

        // buy order: partial match for existing sell order
        test({
            requestId: 4,
            market: "0xdeadbeef",
            amount: 1,
            outcome: "1",
            limitPrice: "0.9",
            type: "buy",
            etherNotFilled: "0.4",
            marketOrderBook: {
                buy: [],
                sell: [{
                    id: "0x123456789abcdef",
                    type: "sell",
                    market: "0xdeadbeef",
                    amount: "0.5",
                    price: "0.9",
                    owner: "0x0000000000000000000000000000000000001337",
                    block: 1117314,
                    outcome: "1"
                }]
            },
            userPosition: {qtyShares: 0},
            onBuySellSuccess: function (requestId, res) {
                requests[requestId].buySell = true;
            },
            onTradeSuccess: function (requestId, res) {
                assert.isTrue(requests[requestId].buySell);
                requests[requestId].done();
                delete requests[requestId];
            }
        });

        // sell order (have shares): create sell order
        test({
            requestId: 5,
            market: "0xdeadbeef",
            amount: 1,
            outcome: "1",
            limitPrice: "0.6",
            type: "sell",
            marketOrderBook: {buy: [], sell: []},
            userPosition: {qtyShares: 1},
            onBuySellSuccess: function (requestId, res) {
                requests[requestId].done();
                delete requests[requestId];
            }
        });

        // sell shares (have shares): match existing buy order exactly
        test({
            requestId: 6,
            market: "0xdeadbeef",
            amount: 1,
            outcome: "1",
            limitPrice: "0.1",
            type: "sell",
            marketOrderBook: {
                buy: [{
                    id: "0x123456789abcdef",
                    type: "buy",
                    market: "0xdeadbeef",
                    amount: "1",
                    price: "0.1",
                    owner: "0x0000000000000000000000000000000000001337",
                    block: 1117314,
                    outcome: "1"
                }],
                sell: []
            },
            userPosition: {qtyShares: 1},
            onTradeSuccess: function (requestId, res) {
                requests[requestId].done();
                delete requests[requestId];
            }
        });

        // sell shares (have shares): partial match for existing buy order
        test({
            requestId: 7,
            market: "0xdeadbeef",
            amount: 1,
            outcome: "1",
            limitPrice: "0.5",
            type: "sell",
            sharesNotSold: "0.5",
            marketOrderBook: {
                buy: [{
                    id: "0x123456789abcdef",
                    type: "buy",
                    market: "0xdeadbeef",
                    amount: "0.5",
                    price: "0.5",
                    owner: "0x0000000000000000000000000000000000001337",
                    block: 1117314,
                    outcome: "1"
                }],
                sell: []
            },
            userPosition: {qtyShares: 1},
            onBuySellSuccess: function (requestId, res) {
                requests[requestId].buySell = true;
            },
            onTradeSuccess: function (requestId, res) {
                assert.isTrue(requests[requestId].buySell);
                requests[requestId].done();
                delete requests[requestId];
            }
        });

        // short sell (no matching buy order): buy complete set + create sell order
        test({
            requestId: 8,
            market: "0xdeadbeef",
            amount: 1,
            outcome: "1",
            limitPrice: "0.6",
            type: "sell",
            marketOrderBook: {buy: [], sell: []},
            userPosition: {qtyShares: 0},
            onBuyCompleteSetsSuccess: function (requestId, res) {
                requests[requestId].buyCompleteSets = true;
            },
            onBuySellSuccess: function (requestId, res) {
                assert.isTrue(requests[requestId].buyCompleteSets);
                requests[requestId].done();
                delete requests[requestId];
            }
        });

        // short sell (matching buy order): use short_sell method
        test({
            requestId: 9,
            market: "0xdeadbeef",
            amount: 1,
            outcome: "1",
            limitPrice: "0.6",
            type: "sell",
            marketOrderBook: {
                buy: [{
                    id: "0x123456789abcdef",
                    type: "buy",
                    market: "0xdeadbeef",
                    amount: "1",
                    price: "0.6",
                    owner: "0x0000000000000000000000000000000000001337",
                    block: 1117314,
                    outcome: "1"
                }],
                sell: []
            },
            userPosition: {qtyShares: 0},
            onTradeSuccess: function (requestId, res) {
                requests[requestId].done();
                delete requests[requestId];
            }
        });

        // short sell (2 matching buy orders): use short_sell method
        test({
            requestId: 10,
            market: "0xdeadbeef",
            amount: 1,
            outcome: "1",
            limitPrice: "0.6",
            type: "sell",
            marketOrderBook: {
                buy: [{
                    id: "0x123456789abcdef",
                    type: "buy",
                    market: "0xdeadbeef",
                    amount: "0.6",
                    price: "0.6",
                    owner: "0x0000000000000000000000000000000000001337",
                    block: 1117314,
                    outcome: "1"
                }, {
                    id: "0x123456789abcdef0",
                    type: "buy",
                    market: "0xdeadbeef",
                    amount: "0.4",
                    price: "0.6",
                    owner: "0x0000000000000000000000000000000000001338",
                    block: 1117314,
                    outcome: "1"
                }],
                sell: []
            },
            userPosition: {qtyShares: 0},
            onTradeSuccess: function (requestId, res) {
                if (!requests[requestId].shortSellCount) {
                    requests[requestId].shortSellCount = 1;
                } else {
                    requests[requestId].done();
                    delete requests[requestId];
                }
            }
        });
    });

	describe("makeTradeHash", function () {
		var augur;
		before(function () {
			augur = tools.setup(require(augurpath), process.argv.slice(2));
		});
		var test = function (t) {
			it(JSON.stringify(t), function () {
				this.timeout(tools.TIMEOUT);
				var trade_ids = t.trade_ids || random.hashArray(t.numTrades || random.int(1, 100));
				var tradeHash = augur.makeTradeHash(t.max_value, t.max_amount, trade_ids);
				var contractTradeHash = augur.Trades.makeTradeHash({
					max_value: abi.fix(t.max_value, "hex"),
					max_amount: abi.fix(t.max_amount, "hex"),
					trade_ids: trade_ids
				});
				assert.strictEqual(tradeHash, contractTradeHash);
			});
		};
		test({max_value: 1, max_amount: 0, trade_ids: ["0xb5865502c4ce95c1fd5178c975863dd9d412363934a7072fa4bad093190c786a"]});
		test({max_value: 0, max_amount: 1, trade_ids: ["0xb5865502c4ce95c1fd5178c975863dd9d412363934a7072fa4bad093190c786a"]});
		test({max_value: 1, max_amount: 0, trade_ids: ["0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"]});
		test({max_value: 0, max_amount: 1, trade_ids: ["0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"]});
		test({max_value: 1, max_amount: 0, trade_ids: ["-0x8000000000000000000000000000000000000000000000000000000000000000"]});
		test({max_value: 0, max_amount: 1, trade_ids: ["-0x8000000000000000000000000000000000000000000000000000000000000000"]});
		test({max_value: "0x0", max_amount: "0x1", trade_ids: ["0xb5865502c4ce95c1fd5178c975863dd9d412363934a7072fa4bad093190c786a"]});
		test({max_value: "0x1", max_amount: "0x0", trade_ids: ["0xb5865502c4ce95c1fd5178c975863dd9d412363934a7072fa4bad093190c786a"]});
		test({max_value: "0x0", max_amount: "0x1", trade_ids: ["0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"]});
		test({max_value: "0x1", max_amount: "0x0", trade_ids: ["0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"]});
		test({max_value: "0x0", max_amount: "0x1", trade_ids: ["-0x4a79aafd3b316a3e02ae87368a79c2262bedc9c6cb58f8d05b452f6ce6f38796"]});
		test({max_value: "0x1", max_amount: "0x0", trade_ids: ["-0x4a79aafd3b316a3e02ae87368a79c2262bedc9c6cb58f8d05b452f6ce6f38796"]});
		test({max_value: "0x0", max_amount: "0x1", trade_ids: ["-0x8000000000000000000000000000000000000000000000000000000000000000"]});
		test({max_value: "0x1", max_amount: "0x0", trade_ids: ["-0x8000000000000000000000000000000000000000000000000000000000000000"]});
		for (var i = 1; i < 5; ++i) {
			for (var j = 1; j < 5; ++j) {
				for (var k = 1; k < 5; ++k) {
					test({max_value: i, max_amount: j, numTrades: k});
					test({max_value: i, max_amount: j});
					test({max_value: random.int(1, i), max_amount: random.int(1, j), numTrades: random.int(1, k)});
				}
			}
		}
	});
});

describe("Integration tests", function () {

    if (!process.env.AUGURJS_INTEGRATION_TESTS) return;

    var augur = tools.setup(require(augurpath), process.argv.slice(2));
    var branchID = augur.constants.DEFAULT_BRANCH_ID;
    var markets = augur.getMarketsInBranch(branchID);
    var password = fs.readFileSync(join(process.env.HOME, ".ethereum", ".password")).toString();
    var accounts = augur.rpc.personal("listAccounts");
    var unlockable = [augur.from, accounts[0], accounts[2]];

    beforeEach("top up accounts", function (done) {
        this.timeout(tools.TIMEOUT*unlockable.length);
        augur = tools.setup(tools.reset(augurpath), process.argv.slice(2));
        async.eachSeries(unlockable, function (account, nextAccount) {
            augur.rpc.personal("unlockAccount", [account, password], function (unlocked) {
                augur.getCashBalance(account, function (cashBalance) {
                    if (parseFloat(cashBalance) > 2500) return nextAccount();
                    augur.useAccount(account);
                    augur.fundNewAccount({
                        branch: augur.constants.DEFAULT_BRANCH_ID,
                        onSent: function (r) {
                            assert.strictEqual(r.callReturn, "1");
                        },
                        onSuccess: function (r) {
                            assert.strictEqual(r.callReturn, "1");
                            nextAccount();
                        },
                        onFailed: nextAccount
                    });
                });
            });
        }, done);
    });

    describe("buy", function () {
        var test = function (t) {
            it(JSON.stringify(t), function (done) {
                this.timeout(tools.TIMEOUT);
                augur.get_total_trades(t.market, function (initialTotalTrades) {
                    initialTotalTrades = parseInt(initialTotalTrades);
                    augur.buy({
                        amount: t.amount,
                        price: t.price,
                        market: t.market,
                        outcome: t.outcome,
                        onSent: function (r) {
                            assert.isString(r.txHash);
                            assert.isString(r.callReturn);
                        },
                        onSuccess: function (r) {
                            augur.get_trade(r.callReturn, function (trade) {
                                assert.isObject(trade);
                                assert.approximately(Number(trade.amount), Number(t.amount), tools.EPSILON);
                                assert.approximately(Number(trade.price), Number(t.price), tools.EPSILON);
                                assert.strictEqual(trade.market, t.market);
                                assert.strictEqual(trade.outcome, t.outcome);
                                augur.get_total_trades(t.market, function (totalTrades) {
                                    assert.isAbove(parseInt(totalTrades), initialTotalTrades);
                                    done();
                                });
                            });
                        },
                        onFailed: done
                    });
                });
            });
        };
        test({
            market: markets[markets.length - 1],
            amount: 1,
            price: "0.5",
            outcome: "1"
        });
        test({
            market: markets[markets.length - 1],
            amount: "0.25",
            price: "0.52",
            outcome: "1"
        });
    });

    describe("sell", function () {
        var test = function (t) {
            it(JSON.stringify(t), function (done) {
                this.timeout(tools.TIMEOUT);
                augur.buyCompleteSets({
                    market: t.market,
                    amount: t.amount,
                    onSent: function (r) {},
                    onSuccess: function (r) {
                        augur.get_total_trades(t.market, function (initialTotalTrades) {
                            initialTotalTrades = parseInt(initialTotalTrades);
                            augur.sell({
                                amount: t.amount,
                                price: t.price,
                                market: t.market,
                                outcome: t.outcome,
                                onSent: function (r) {
                                    assert.isString(r.txHash);
                                    assert.isString(r.callReturn);
                                },
                                onSuccess: function (r) {
                                    augur.get_trade(r.callReturn, function (trade) {
                                        assert.isObject(trade);
                                        assert.approximately(Number(trade.amount), Number(t.amount), tools.EPSILON);
                                        assert.approximately(Number(trade.price), Number(t.price), tools.EPSILON);
                                        assert.strictEqual(trade.market, t.market);
                                        assert.strictEqual(trade.outcome, t.outcome);
                                        augur.get_total_trades(t.market, function (totalTrades) {
                                            assert.isAbove(parseInt(totalTrades), initialTotalTrades);
                                            done();
                                        });
                                    });
                                },
                                onFailed: done
                            });
                        });
                    },
                    onFailed: done
                });
            });
        };
        test({
            market: markets[markets.length - 1],
            amount: 1,
            price: "0.5",
            outcome: "1"
        });
        test({
            market: markets[markets.length - 1],
            amount: "0.25",
            price: "0.52",
            outcome: "1"
        });
    });

    describe("cancel", function () {
        var test = function (t) {
            it(JSON.stringify(t), function (done) {
                this.timeout(tools.TIMEOUT);
                augur.buyCompleteSets({
                    market: t.market,
                    amount: t.amount,
                    onSent: function (r) {},
                    onSuccess: function (r) {
                        augur.sell({
                            amount: t.amount,
                            price: t.price,
                            market: t.market,
                            outcome: t.outcome,
                            onSent: function (r) {
                                assert(r.txHash);
                                assert(r.callReturn);
                            },
                            onSuccess: function (r) {
                                assert(r.txHash);
                                assert(r.callReturn);
                                augur.get_trade_ids(t.market, function (trade_ids) {
                                    console.log("canceling:", trade_ids[0]);
                                    augur.cancel(trade_ids[0], function (r) {
                                        console.log("Canceled:", r);
                                        assert(r.txHash);
                                        assert.strictEqual(r.callReturn, "1");
                                    }, function (r) {
                                        assert(r.txHash);
                                        assert.strictEqual(r.callReturn, "1");
                                        done();
                                    }, done);
                                });
                            },
                            onFailed: done
                        });
                    },
                    onFailed: done
                });
            });
        };
        test({
            market: markets[markets.length - 1],
            amount: 1,
            price: "0.5",
            outcome: "1"
        });
    });

    describe("trade", function () {
        var test = function (t) {
            it(JSON.stringify(t), function (done) {
                this.timeout(tools.TIMEOUT*10);
                augur.useAccount(accounts[0]);
                var initialTotalTrades = parseInt(augur.Markets.get_total_trades(t.market));
                augur.buyCompleteSets({
                    market: t.market,
                    amount: t.amount,
                    onSent: function (r) {},
                    onSuccess: function (r) {
                        augur.sell({
                            amount: t.amount,
                            price: "0.01",
                            market: t.market,
                            outcome: t.outcome,
                            onSent: function (r) {},
                            onSuccess: function (r) {
                                augur.useAccount(accounts[2]);
                                augur.get_trade_ids(t.market, function (trade_ids) {
                                    async.eachSeries(trade_ids, function (thisTrade, nextTrade) {
                                        augur.get_trade(thisTrade, function (tradeInfo) {
                                            if (!tradeInfo) return nextTrade("no trade info found");
                                            if (tradeInfo.owner === augur.from) return nextTrade();
                                            if (tradeInfo.type === "buy") return nextTrade();
                                            augur.trade({
                                                max_value: t.max_value,
                                                max_amount: 0,
                                                trade_ids: [thisTrade],
                                                onTradeHash: function (r) {
                                                    assert.notProperty(r, "error");
                                                    assert.isString(r);
                                                },
                                                onCommitSent: function (r) {
                                                    assert.strictEqual(r.callReturn, "1");
                                                },
                                                onCommitSuccess: function (r) {
                                                    assert.strictEqual(r.callReturn, "1");
                                                },
                                                onCommitFailed: nextTrade,
                                                onTradeSent: function (r) {
                                                    // console.log("trade sent:", r)
                                                    assert.isNull(r.callReturn);
                                                },
                                                onTradeSuccess: function (r) {
                                                    // console.log("trade success:", r)
                                                    assert.isArray(r.callReturn);
                                                    assert.strictEqual(r.callReturn[0], 1);
                                                    assert.strictEqual(r.callReturn.length, 3);
                                                    nextTrade(r);
                                                },
                                                onTradeFailed: nextTrade
                                            });
                                        });
                                    }, function (x) {
                                        if (x && x.callReturn) return done();
                                        done(x);
                                    });
                                });
                            },
                            onFailed: done
                        });
                    },
                    onFailed: done
                });
            });
        };
        test({
            market: markets[markets.length - 1],
            amount: 1,
            outcome: "1",
            max_value: 1
        });
    });

    describe("short_sell", function () {
        var test = function (t) {
            it(JSON.stringify(t), function (done) {
                this.timeout(tools.TIMEOUT*10);
                augur.useAccount(accounts[0]);
                var initialTotalTrades = parseInt(augur.get_total_trades(t.market));
                augur.buy({
                    amount: 1,
                    price: "0.999",
                    market: t.market,
                    outcome: t.outcome,
                    onSent: function (r) {},
                    onSuccess: function (r) {
                        augur.useAccount(accounts[2]);
                        augur.get_trade_ids(t.market, function (trade_ids) {
                            async.eachSeries(trade_ids, function (thisTrade, nextTrade) {
                                augur.get_trade(thisTrade, function (tradeInfo) {
                                    if (!tradeInfo) return nextTrade("no trade info found");
                                    if (tradeInfo.owner === augur.from) return nextTrade();
                                    if (tradeInfo.type === "sell") return nextTrade();
                                    augur.short_sell({
                                        buyer_trade_id: thisTrade,
                                        max_amount: t.max_amount,
                                        onTradeHash: function (r) {
                                            assert.notProperty(r, "error");
                                            assert.isString(r);
                                        },
                                        onCommitSent: function (r) {
                                            assert.strictEqual(r.callReturn, "1");
                                        },
                                        onCommitSuccess: function (r) {
                                            assert.strictEqual(r.callReturn, "1");
                                        },
                                        onCommitFailed: nextTrade,
                                        onTradeSent: function (r) {
                                            // console.log("short sell sent:", r)
                                            assert.isNull(r.callReturn);
                                        },
                                        onTradeSuccess: function (r) {
                                            // console.log("short sell success:", r)
                                            assert.isArray(r.callReturn);
                                            assert.strictEqual(r.callReturn[0], 1);
                                            assert.strictEqual(r.callReturn.length, 4);
                                            nextTrade(r);
                                        },
                                        onTradeFailed: nextTrade
                                    });
                                });
                            }, function (x) {
                                if (x && x.callReturn) return done();
                                done(x);
                            });
                        });
                    },
                    onFailed: done
                });
            });
        };
        test({
            market: markets[markets.length - 1],
            amount: 1,
            outcome: "1",
            max_amount: 1
        });
    });

    // describe("processOrder", function () {
    //     var test = function (t) {
    //         it(JSON.stringify(t), function (done) {
    //             this.timeout(tools.TIMEOUT*10);
    //             augur.useAccount(accounts[0]);
    //             var orderBook = augur.getOrderBook(t.market);
    //             var value = abi.bignum(t.amount).times(abi.bignum(t.limitPrice)).toFixed();
    //             var scalarMinMax = {};
    //             var marketInfo = augur.getMarketInfo(t.market);
    //             if (marketInfo && marketInfo.type === "scalar") {
    //                 scalarMinMax = marketInfo.events[0];
    //             }
    //             augur.processOrder({
    //                 requestId: t.requestId,
    //                 market: t.market,
    //                 marketOrderBook: orderBook,
    //                 userTradeOrder: {
    //                     type: t.type,
    //                     sharesToSell: t.amount,
    //                     etherToBuy: value,
    //                     limitPrice: t.limitPrice,
    //                     outcomeID: t.outcome
    //                 },
    //                 userPosition: {qtyShares: 0},
    //                 scalarMinMax: scalarMinMax,
    //                 onTradeHash: function (tradeOrderId, tradeHash) {
    //                     // console.log("tradeHash:", tradeOrderId, tradeHash);
    //                 },
    //                 onCommitSent: function (tradeOrderId, res) {
    //                     // console.log("commitSent:", tradeOrderId, res);
    //                 },
    //                 onCommitFailed: function (tradeOrderId, err) {
    //                     // console.error("commit failed:", err);
    //                     done(new Error(JSON.stringify(err, null, 2)));
    //                 },
    //                 onNextBlock: function (tradeOrderId, block) {
    //                     // console.log("nextBlock:", tradeOrderId, block);
    //                 },
    //                 onTradeSent: function (tradeOrderId, res) {
    //                     // console.log("trade sent:", tradeOrderId, res);
    //                 },
    //                 onTradeSuccess: function (tradeOrderId, res) {
    //                     // console.log("tradeSuccess:", tradeOrderId, res);
    //                     done();
    //                 },
    //                 onTradeFailed: function (tradeOrderId, err) {
    //                     // console.error("trade failed:", err);
    //                     done(new Error(JSON.stringify(err, null, 2)));
    //                 },
    //                 onBuySellSent: function (requestId, res) {
    //                     // console.log("buySell sent:", requestId, res);
    //                 },
    //                 onBuySellSuccess: function (requestId, res) {
    //                     // console.log("buy/sell order placed on the books successfully!");
    //                     var newOrderBook = augur.getOrderBook(t.market);
    //                     var orderType = t.type;
    //                     for (var i = 0, n = newOrderBook[orderType].length; i < n; ++i) {
    //                         if (t.outcome === newOrderBook[orderType][i].outcome &&
    //                             parseFloat(value) === parseFloat(newOrderBook[orderType][i].amount) &&
    //                             accounts[0] === newOrderBook[orderType][i].owner) {
    //                             return done();
    //                         }
    //                     }
    //                     done(new Error("order not found :("));
    //                 },
    //                 onBuySellFailed: function (requestId, err) {
    //                     // console.error("buy/sell failed:", err);
    //                     done(new Error(JSON.stringify(err, null, 2)));
    //                 },
    //                 onBuyCompleteSetsSent: function (requestId, res) {
    //                     // console.log("onBuyCompleteSetsSent:", requestId, res);
    //                 },
    //                 onBuyCompleteSetsSuccess: function (requestId, res) {
    //                     // console.log("onBuyCompleteSetsSuccess:", requestId, res);
    //                 },
    //                 onBuyCompleteSetsFailed: function (requestId, err) {
    //                     // console.error("buyCompleteSets failed:", err);
    //                     done(new Error(JSON.stringify(err, null, 2)));
    //                 }
    //             });
    //         });
    //     };
    //     test({
    //         requestId: 1,
    //         market: markets[markets.length - 1],
    //         amount: 1,
    //         outcome: "1",
    //         limitPrice: "0.001",
    //         type: "buy"
    //     });
    //     test({
    //         requestId: 2,
    //         market: markets[markets.length - 1],
    //         amount: 1,
    //         outcome: "1",
    //         limitPrice: "0.6",
    //         type: "buy"
    //     });
    // });
});