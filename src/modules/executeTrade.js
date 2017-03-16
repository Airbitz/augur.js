"use strict";

var BigNumber = require("bignumber.js");
var async = require("async");
var abi = require("augur-abi");
var selectOrder = require("./selectOrder");
var constants = require("../constants");

module.exports = {

  // if buying numShares must be 0, if selling totalEthWithFee must be 0
  executeTrade: function (marketID, outcomeID, numShares, totalEthWithFee, tradingFees, tradeGroupID, address, getOrderBooks, getTradeIDs, tradeCommitmentCallback, cb) {
    var bnTotalEth, bnNumShares, res, matchingTradeIDs, bnSharesPurchased, bnCashBalance, commitMaxAmount, commitMaxValue, self = this;
    if (this.options.debug.trading) {
      console.log("executeTrade:", marketID, outcomeID, numShares, totalEthWithFee, tradingFees, tradeGroupID, address);
    }
    bnTotalEth = abi.bignum(totalEthWithFee) || constants.ZERO;
    bnNumShares = abi.bignum(numShares) || constants.ZERO;
    res = {
      remainingEth: bnTotalEth,
      remainingShares: bnNumShares,
      filledShares: constants.ZERO,
      filledEth: constants.ZERO,
      tradingFees: constants.ZERO,
      gasFees: constants.ZERO
    };
    bnSharesPurchased = bnNumShares;
    bnCashBalance = bnTotalEth;
    if (bnNumShares.gt(constants.ZERO)) {
      commitMaxAmount = numShares;
      commitMaxValue = "0";
    } else {
      commitMaxAmount = "0";
      commitMaxValue = totalEthWithFee;
    }
    async.until(function () {
      matchingTradeIDs = getTradeIDs(getOrderBooks());
      if (self.options.debug.trading) {
        console.log("matchingTradeIDs:", matchingTradeIDs);
        console.log("remainingEth:", res.remainingEth.toFixed());
        console.log("remainingShares:", res.remainingShares.toFixed());
        console.log("sharesPurchased:", bnSharesPurchased.toFixed());
        console.log("balance:", bnCashBalance.toFixed());
      }
      return !matchingTradeIDs || !matchingTradeIDs.length ||
        (res.remainingEth.lte(constants.PRECISION.zero) && res.remainingShares.lte(constants.PRECISION.zero)) ||
        (bnNumShares.gt(constants.ZERO) && bnSharesPurchased.lte(constants.PRECISION.zero)) ||
        (bnTotalEth.gt(constants.ZERO) && bnCashBalance.lte(constants.PRECISION.zero));
    }, function (nextTrade) {
      var tradeIDs = matchingTradeIDs;
      tradeIDs = tradeIDs.slice(0, 3);
      self.getParticipantSharesPurchased(marketID, address, outcomeID, function (sharesPurchased) {
        bnSharesPurchased = abi.bignum(sharesPurchased);
        self.Cash.balance(address, function (cashBalance) {
          var isRemainder, maxAmount, maxValue;
          bnCashBalance = abi.bignum(cashBalance);
          if (res.remainingShares.gt(bnSharesPurchased)) {
            maxAmount = bnSharesPurchased;
            isRemainder = true;
          } else {
            maxAmount = res.remainingShares;
            isRemainder = false;
          }
          maxValue = BigNumber.min(res.remainingEth, bnCashBalance);
          self.trade({
            max_value: maxValue.toFixed(),
            max_amount: maxAmount.toFixed(),
            trade_ids: tradeIDs,
            tradeGroupID: tradeGroupID,
            sender: address,
            onTradeHash: function (tradeHash) {
              tradeCommitmentCallback({
                tradeHash: abi.format_int256(tradeHash),
                orders: tradeIDs.map(function (tradeID) {
                  return selectOrder.selectOrder(tradeID, getOrderBooks());
                }),
                maxValue: commitMaxValue,
                maxAmount: commitMaxAmount,
                remainingEth: res.remainingEth.toFixed(),
                remainingShares: res.remainingShares.toFixed(),
                filledEth: res.filledEth.toFixed(),
                filledShares: res.filledShares.toFixed(),
                tradingFees: res.tradingFees.gt(constants.ZERO) ? res.tradingFees.toFixed() : tradingFees,
                gasFees: res.gasFees.toFixed()
              });
            },
            onCommitSent: function (data) { if (self.options.debug.trading) console.log("commit sent:", data); },
            onCommitSuccess: function (data) {
              res.gasFees = res.gasFees.plus(abi.bignum(data.gasFees));
              tradeCommitmentCallback({ gasFees: res.gasFees.toFixed() });
            },
            onCommitFailed: nextTrade,
            onNextBlock: function (data) { if (self.options.debug.trading) console.log("trade-onNextBlock", data); },
            onTradeSent: function (data) { if (self.options.debug.trading) console.log("trade sent:", data); },
            onTradeSuccess: function (data) {
              if (self.options.debug.trading) console.log("trade success:", data);
              res.filledShares = res.filledShares.plus(abi.bignum(data.sharesBought));
              res.filledEth = res.filledEth.plus(abi.bignum(data.cashFromTrade));
              if (isRemainder) {
                res.remainingShares = res.remainingShares.minus(maxAmount).plus(abi.bignum(data.unmatchedShares));
              } else {
                res.remainingShares = abi.bignum(data.unmatchedShares);
              }
              res.remainingEth = abi.bignum(data.unmatchedCash);
              res.tradingFees = res.tradingFees.plus(abi.bignum(data.tradingFees));
              res.gasFees = res.gasFees.plus(abi.bignum(data.gasFees));
              tradeCommitmentCallback({
                filledShares: res.filledShares.toFixed(),
                filledEth: res.filledEth.toFixed(),
                remainingShares: res.remainingShares.toFixed(),
                remainingEth: res.remainingEth.toFixed(),
                tradingFees: res.tradingFees.toFixed(),
                gasFees: res.gasFees.toFixed()
              });
              self.getParticipantSharesPurchased(marketID, address, outcomeID, function (sharesPurchased) {
                bnSharesPurchased = abi.bignum(sharesPurchased);
                self.Cash.balance(address, function (cashBalance) {
                  bnCashBalance = abi.bignum(cashBalance);
                  nextTrade();
                });
              });
            },
            onTradeFailed: nextTrade
          });
        });
      });
    }, function (err) {
      if (err) return cb(err);
      if (self.options.debug.trading) console.log("trade complete:", JSON.stringify(res, null, 2));
      cb(null, res);
    });
  },

  executeShortSell: function (marketID, outcomeID, numShares, tradingFees, tradeGroupID, address, getOrderBooks, getTradeIDs, tradeCommitmentCallback, cb) {
    var res, matchingIDs, self = this;
    res = {
      remainingShares: abi.bignum(numShares) || constants.ZERO,
      filledShares: constants.ZERO,
      filledEth: constants.ZERO,
      tradingFees: constants.ZERO,
      gasFees: constants.ZERO
    };
    matchingIDs = getTradeIDs(getOrderBooks());
    if (self.options.debug.trading) console.log("matching trade IDs:", matchingIDs);
    if (!matchingIDs || !matchingIDs.length || res.remainingShares.lte(constants.ZERO)) return cb(null, res);
    async.eachSeries(matchingIDs, function (matchingID, nextMatchingID) {
      var maxAmount = res.remainingShares.toFixed();
      self.short_sell({
        max_amount: maxAmount,
        buyer_trade_id: matchingID,
        sender: address,
        tradeGroupID: tradeGroupID,
        onTradeHash: function (tradeHash) {
          tradeCommitmentCallback({
            tradeHash: abi.format_int256(tradeHash),
            isShortSell: true,
            maxAmount: numShares,
            maxValue: "0",
            orders: [selectOrder.selectOrder(matchingID, getOrderBooks())],
            remainingEth: "0",
            remainingShares: res.remainingShares.toFixed(),
            filledEth: res.filledEth.toFixed(),
            filledShares: res.filledShares.toFixed(),
            tradingFees: res.tradingFees.gt(constants.ZERO) ? res.tradingFees.toFixed() : tradingFees,
            gasFees: res.gasFees.toFixed()
          });
        },
        onCommitSent: function (data) { if (self.options.debug.trading)  console.log("short sell commit sent:", data); },
        onCommitSuccess: function (data) {
          res.gasFees = res.gasFees.plus(abi.bignum(data.gasFees));
          tradeCommitmentCallback({ gasFees: res.gasFees.toFixed() });
        },
        onCommitFailed: nextMatchingID,
        onNextBlock: function (data) { if (self.options.debug.trading)  console.log("short_sell onNextBlock", data); },
        onTradeSent: function (data) { if (self.options.debug.trading)  console.debug("short sell sent", data); },
        onTradeSuccess: function (data) {
          if (data.unmatchedShares) {
            res.remainingShares = abi.bignum(data.unmatchedShares);
          } else {
            res.remainingShares = constants.ZERO;
          }
          if (data.matchedShares) {
            res.filledShares = res.filledShares.plus(abi.bignum(data.matchedShares));
          }
          if (data.cashFromTrade) {
            res.filledEth = res.filledEth.plus(abi.bignum(data.cashFromTrade));
          }
          res.tradingFees = res.tradingFees.plus(abi.bignum(data.tradingFees));
          res.gasFees = res.gasFees.plus(abi.bignum(data.gasFees));
          tradeCommitmentCallback({
            filledShares: res.filledShares.toFixed(),
            filledEth: res.filledEth.toFixed(),
            remainingShares: res.remainingShares.toFixed(),
            tradingFees: res.tradingFees.toFixed(),
            gasFees: res.gasFees.toFixed()
          });
          if (res.remainingShares.gt(constants.PRECISION.zero)) return nextMatchingID();
          nextMatchingID({ isComplete: true });
        },
        onTradeFailed: nextMatchingID
      });
    }, function (err) {
      if (err && !err.isComplete) return cb(err);
      if (self.options.debug.trading) console.log("short_sell success:", JSON.stringify(res, null, 2));
      cb(null, res);
    });
  }

};
