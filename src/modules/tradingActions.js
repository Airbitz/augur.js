"use strict";

var clone = require("clone");
var BigNumber = require("bignumber.js");
var abi = require("augur-abi");
var constants = require("../constants");
var abacus = require("./abacus");

module.exports = {

  calculateBuyTradeIDs: function (marketID, outcomeID, limitPrice, orderBooks, address) {
    var orders = (orderBooks[marketID] && orderBooks[marketID].sell) || {};
    return this.filterByPriceAndOutcomeAndUserSortByPrice(orders, "buy", limitPrice, outcomeID, address).map(function (order) { return order.id; });
  },

  calculateSellTradeIDs: function (marketID, outcomeID, limitPrice, orderBooks, address) {
    var orders = (orderBooks[marketID] && orderBooks[marketID].buy) || {};
    return this.filterByPriceAndOutcomeAndUserSortByPrice(orders, "sell", limitPrice, outcomeID, address).map(function (order) { return order.id; });
  },

  /**
   * Calculates (approximately) gas needed to run the transaction
   *
   * @param {Object} tx
   * @param {Number} gasPrice
   * @return {BigNumber}
   */
  getTxGasEth: function (tx, gasPrice) {
    tx.gasLimit = tx.gas || this.rpc.DEFAULT_GAS;
    tx.gasPrice = gasPrice;
    return abi.unfix(abi.bignum(tx.gasLimit).times(abi.bignum(gasPrice)));
  },

  /**
   * Bids are sorted descendingly, asks are sorted ascendingly
   *
   * @param {Array} orders Bids or asks
   * @param {String} traderOrderType What trader want to do (buy or sell)
   * @param {BigNumber=} limitPrice When buying it's max price to buy at, when selling it min price to sell at. If it's null order is considered to be market order
   * @param {String} outcomeId
   * @param {String} userAddress
   * @return {Array.<Object>}
   */
  filterByPriceAndOutcomeAndUserSortByPrice: function (orders, traderOrderType, limitPrice, outcomeId, userAddress) {
    var isMarketOrder;
    if (!orders) return [];
    isMarketOrder = limitPrice === null || limitPrice === undefined;
    return Object.keys(orders)
      .map(function (orderID) {
        return orders[orderID];
      })
      .filter(function (order) {
        var isMatchingPrice;
        if (!order || !order.price) return false;
        if (isMarketOrder) {
          isMatchingPrice = true;
        } else {
          isMatchingPrice = traderOrderType === "buy" ? new BigNumber(order.price, 10).lte(limitPrice) : new BigNumber(order.price, 10).gte(limitPrice);
        }
        return order.outcome === outcomeId && order.owner !== userAddress && isMatchingPrice;
      })
      .sort(function compareOrdersByPrice(order1, order2) {
        return traderOrderType === "buy" ? order1.price - order2.price : order2.price - order1.price;
      });
  },

  /**
   *
   * @param {BigNumber} shares
   * @param {BigNumber} limitPrice
   * @param {BigNumber} makerFee
   * @param {Number} gasPrice
   * @return {{action: string, shares: string, gasEth, feeEth: string, costEth: string, avgPrice: string}}
   */
  getBidAction: function (shares, limitPrice, makerFee, gasPrice) {
    var bidGasEth = this.getTxGasEth(clone(this.tx.BuyAndSellShares.buy), gasPrice);
    var etherToBid = shares.times(limitPrice).dividedBy(constants.ONE).floor();
    var feeEth = etherToBid.times(makerFee).dividedBy(constants.ONE).floor();
    return {
      action: "BID",
      shares: abi.unfix(shares, "string"),
      gasEth: bidGasEth.toFixed(),
      feeEth: abi.unfix(feeEth, "string"),
      feePercent: abi.unfix(makerFee).times(100).abs().toFixed(),
      costEth: abi.unfix(etherToBid.abs().plus(feeEth)).neg().toFixed(),
      avgPrice: abi.unfix(etherToBid.plus(feeEth).dividedBy(shares).times(constants.ONE).floor(), "string"),
      noFeePrice: abi.unfix(limitPrice, "string")
    };
  },

  /**
   *
   * @param {BigNumber} buyEth
   * @param {BigNumber} sharesFilled
   * @param {BigNumber} takerFeeEth
   * @param {Number} gasPrice
   * @return {{action: string, shares: string, gasEth, feeEth: string, costEth: string, avgPrice: string}}
   */
  getBuyAction: function (buyEth, sharesFilled, takerFeeEth, gasPrice) {
    var tradeGasEth = this.getTxGasEth(clone(this.tx.Trade.trade), gasPrice);
    var fxpBuyEth = abi.fix(buyEth);
    var fxpTakerFeeEth = abi.fix(takerFeeEth);
    var fxpSharesFilled = abi.fix(sharesFilled);
    return {
      action: "BUY",
      shares: sharesFilled.toFixed(),
      gasEth: tradeGasEth.toFixed(),
      feeEth: takerFeeEth.toFixed(),
      feePercent: abi.unfix(fxpTakerFeeEth.dividedBy(fxpBuyEth).times(constants.ONE).floor().times(100).abs(), "string"),
      costEth: buyEth.neg().toFixed(),
      avgPrice: abi.unfix(fxpBuyEth.dividedBy(fxpSharesFilled).times(constants.ONE).floor(), "string"),
      noFeePrice: abi.unfix(fxpBuyEth.minus(fxpTakerFeeEth).dividedBy(fxpSharesFilled).times(constants.ONE).floor(), "string")
    };
  },

  /**
   *
   * @param {BigNumber} shares
   * @param {BigNumber} limitPrice
   * @param {BigNumber} makerFee
   * @param {Number} gasPrice
   * @return {{action: string, shares: string, gasEth, feeEth: string, costEth: string, avgPrice: string}}
   */
  getAskAction: function (shares, limitPrice, makerFee, gasPrice) {
    var askGasEth = this.getTxGasEth(clone(this.tx.BuyAndSellShares.sell), gasPrice);
    var costEth = shares.times(limitPrice).dividedBy(constants.ONE).floor();
    var feeEth = costEth.times(makerFee).dividedBy(constants.ONE).floor();
    return {
      action: "ASK",
      shares: abi.unfix(shares, "string"),
      gasEth: askGasEth.toFixed(),
      feeEth: abi.unfix(feeEth, "string"),
      feePercent: abi.unfix(makerFee).times(100).toFixed(),
      costEth: abi.unfix(costEth.minus(feeEth), "string"),
      avgPrice: abi.unfix(costEth.minus(feeEth).dividedBy(shares).times(constants.ONE).floor().abs(), "string"),
      noFeePrice: abi.unfix(limitPrice, "string")
    };
  },

  /**
   *
   * @param {BigNumber} sellEth
   * @param {BigNumber} sharesFilled
   * @param {BigNumber} takerFeeEth
   * @param {Number} gasPrice
   * @return {{action: string, shares: string, gasEth, feeEth: string, costEth: string, avgPrice: string}}
   */
  getSellAction: function (sellEth, sharesFilled, takerFeeEth, gasPrice) {
    var tradeGasEth = this.getTxGasEth(clone(this.tx.Trade.trade), gasPrice);
    var fxpSellEth = abi.fix(sellEth);
    var fxpSharesFilled = abi.fix(sharesFilled);
    var fxpTakerFeeEth = abi.fix(takerFeeEth);
    return {
      action: "SELL",
      shares: sharesFilled.toFixed(),
      gasEth: tradeGasEth.toFixed(),
      feeEth: takerFeeEth.toFixed(),
      feePercent: abi.unfix(fxpTakerFeeEth.dividedBy(fxpSellEth).times(constants.ONE).floor().times(100).abs(), "string"),
      costEth: sellEth.toFixed(),
      avgPrice: abi.unfix(fxpSellEth.dividedBy(fxpSharesFilled).times(constants.ONE).floor(), "string"),
      noFeePrice: abi.unfix(fxpSellEth.plus(fxpTakerFeeEth).dividedBy(fxpSharesFilled).times(constants.ONE).floor(), "string")
    };
  },

  /**
   *
   * @param {BigNumber} shortSellEth
   * @param {BigNumber} shares
   * @param {BigNumber} takerFeeEth
   * @param {Number} gasPrice
   * @return {{action: string, shares: string, gasEth, feeEth: string, costEth: string, avgPrice: string}}
   */
  getShortSellAction: function (shortSellEth, shares, takerFeeEth, gasPrice) {
    var shortSellGasEth = this.getTxGasEth(clone(this.tx.Trade.short_sell), gasPrice);
    var fxpShortSellEth = abi.fix(shortSellEth);
    var fxpTakerFeeEth = abi.fix(takerFeeEth);
    var fxpShares = abi.fix(shares);
    return {
      action: "SHORT_SELL",
      shares: shares.toFixed(),
      gasEth: shortSellGasEth.toFixed(),
      feeEth: takerFeeEth.toFixed(),
      feePercent: abi.unfix(fxpTakerFeeEth.dividedBy(fxpShortSellEth).times(constants.ONE).floor().times(100).abs(), "string"),
      costEth: shortSellEth.neg().toFixed(),
      avgPrice: abi.unfix(fxpShortSellEth.dividedBy(fxpShares).times(constants.ONE).floor(), "string"),
      noFeePrice: abi.unfix(fxpShortSellEth.plus(fxpTakerFeeEth).dividedBy(fxpShares).times(constants.ONE).floor(), "string")
    };
  },

  /**
   *
   * @param {BigNumber} shares
   * @param {BigNumber} limitPrice
   * @param {BigNumber} makerFee
   * @param {Number} gasPrice
   * @return {{action: string, shares: string, gasEth: string, feeEth: string, costEth: string, avgPrice: string}}
   */
  getShortAskAction: function (shares, limitPrice, makerFee, gasPrice) {
    var buyCompleteSetsGasEth = this.getTxGasEth(clone(this.tx.CompleteSets.buyCompleteSets), gasPrice);
    var askGasEth = this.getTxGasEth(clone(this.tx.BuyAndSellShares.sell), gasPrice);
    var feeEth = shares.times(limitPrice).dividedBy(constants.ONE).floor().times(makerFee).dividedBy(constants.ONE).floor();
    var costEth = shares.neg().minus(feeEth);
    return {
      action: "SHORT_ASK",
      shares: abi.unfix(shares, "string"),
      gasEth: buyCompleteSetsGasEth.plus(askGasEth).toFixed(),
      feeEth: abi.unfix(feeEth, "string"),
      feePercent: abi.unfix(makerFee).times(100).abs().toFixed(),
      costEth: abi.unfix(costEth, "string"),
      avgPrice: abi.unfix(costEth.neg().dividedBy(shares).times(constants.ONE).floor(), "string"),
      noFeePrice: abi.unfix(limitPrice, "string") // "limit price" (not really no fee price)
    };
  },

  calculateTradeTotals: function (type, numShares, limitPrice, tradeActions) {
    var tradeActionsTotals, numTradeActions, totalCost, tradingFeesEth, gasFeesRealEth, i;
    tradeActionsTotals = {
      numShares: numShares,
      limitPrice: limitPrice,
      side: type,
      totalFee: 0,
      totalCost: 0
    };
    numTradeActions = tradeActions.length;
    if (numTradeActions) {
      totalCost = constants.ZERO;
      tradingFeesEth = constants.ZERO;
      gasFeesRealEth = constants.ZERO;
      for (i = 0; i < numTradeActions; ++i) {
        totalCost = totalCost.plus(abi.bignum(tradeActions[i].costEth));
        tradingFeesEth = tradingFeesEth.plus(abi.bignum(tradeActions[i].feeEth));
        gasFeesRealEth = gasFeesRealEth.plus(abi.bignum(tradeActions[i].gasEth));
      }
      tradeActionsTotals.tradeActions = tradeActions;
      tradeActionsTotals.totalCost = totalCost.toFixed();
      tradeActionsTotals.tradingFeesEth = tradingFeesEth.toFixed();
      tradeActionsTotals.gasFeesRealEth = gasFeesRealEth.toFixed();
      tradeActionsTotals.totalFee = tradingFeesEth.toFixed();
      if (type === "sell") {
        tradeActionsTotals.feePercent = tradingFeesEth.dividedBy(totalCost.minus(tradingFeesEth))
          .times(100).abs()
          .toFixed();
      } else {
        tradeActionsTotals.feePercent = tradingFeesEth.dividedBy(totalCost.plus(tradingFeesEth))
          .times(100).abs()
          .toFixed();
      }
    }
    return tradeActionsTotals;
  },

  /**
   * Allows to estimate what trading methods will be called based on user's order. This is useful so users know how
   * much they pay for trading
   *
   * @param {String} type 'buy' or 'sell'
   * @param {String|BigNumber} orderShares
   * @param {String|BigNumber=} orderLimitPrice null value results in market order
   * @param {String|BigNumber} takerFee Decimal string ("0.02" for 2% fee)
   * @param {String|BigNumber} makerFee Decimal string ("0.02" for 2% fee)
   * @param {String} userAddress Address of trader to exclude orders from order book
   * @param {String|BigNumber} userPositionShares
   * @param {String} outcomeId
   * @param {Object} marketOrderBook Bids and asks for market (mixed for all outcomes)
   * @param {Object} scalarMinMax {minValue, maxValue} if scalar, null otherwise
   * @return {Array}
   */
  getTradingActions: function (type, orderShares, orderLimitPrice, takerFee, makerFee, userAddress, userPositionShares, outcomeId, range, marketOrderBook, scalarMinMax) {
    var remainingOrderShares, i, length, orderSharesFilled, bid, ask, bidAmount, isMarketOrder, fees, adjustedFees, totalTakerFeeEth, adjustedLimitPrice, bnTakerFee, bnMakerFee, bnRange, gasPrice, tradingCost, fullPrecisionPrice, matchingSortedAsks, areSuitableOrders, buyActions, etherToTrade, matchingSortedBids, areSuitableBids, userHasPosition, sellActions, etherToSell, remainingPositionShares, newBid, askShares, newTradeActions, etherToShortSell, tradingActions, augur = this;
    if (type && type.constructor === Object) {
      orderShares = type.orderShares;
      orderLimitPrice = type.orderLimitPrice;
      takerFee = type.takerFee;
      makerFee = type.makerFee;
      userAddress = type.userAddress;
      userPositionShares = type.userPositionShares;
      outcomeId = type.outcomeId;
      marketOrderBook = type.marketOrderBook;
      range = type.range;
      scalarMinMax = type.scalarMinMax;
      type = type.type;
    }
    userAddress = abi.format_address(userAddress);
    orderShares = new BigNumber(orderShares, 10);
    orderLimitPrice = (orderLimitPrice === null || orderLimitPrice === undefined) ?
      null :
      new BigNumber(orderLimitPrice, 10);
    bnTakerFee = new BigNumber(takerFee, 10);
    bnMakerFee = new BigNumber(makerFee, 10);
    bnRange = new BigNumber(range, 10);
    userPositionShares = new BigNumber(userPositionShares, 10);
    isMarketOrder = orderLimitPrice === null || orderLimitPrice === undefined;
    fees = abacus.calculateFxpTradingFees(bnMakerFee, bnTakerFee);
    if (!isMarketOrder) {
      adjustedLimitPrice = (scalarMinMax && scalarMinMax.minValue) ?
        new BigNumber(abacus.shrinkScalarPrice(scalarMinMax.minValue, orderLimitPrice), 10) :
        orderLimitPrice;
      adjustedFees = abacus.calculateFxpMakerTakerFees(
        abacus.calculateFxpAdjustedTradingFee(
          fees.tradingFee,
          abi.fix(adjustedLimitPrice),
          abi.fix(bnRange)
        ),
        fees.makerProportionOfFee
      );
    }
    gasPrice = augur.rpc.gasPrice || constants.DEFAULT_GASPRICE;
    if (type === "buy") {
      matchingSortedAsks = augur.filterByPriceAndOutcomeAndUserSortByPrice(marketOrderBook.sell, type, orderLimitPrice, outcomeId, userAddress);
      areSuitableOrders = matchingSortedAsks.length > 0;
      if (!areSuitableOrders) {
        if (isMarketOrder) {
          tradingActions = this.calculateTradeTotals(type, orderShares.toFixed(), orderLimitPrice && orderLimitPrice.toFixed(), []);
        } else {
          tradingActions = this.calculateTradeTotals(type, orderShares.toFixed(), orderLimitPrice && orderLimitPrice.toFixed(), [
            augur.getBidAction(abi.fix(orderShares), abi.fix(adjustedLimitPrice), adjustedFees.maker, gasPrice)
          ]);
        }
      } else {
        buyActions = [];
        etherToTrade = constants.ZERO;
        totalTakerFeeEth = constants.ZERO;
        remainingOrderShares = orderShares;
        length = matchingSortedAsks.length;
        for (i = 0; i < length; i++) {
          ask = matchingSortedAsks[i];
          orderSharesFilled = BigNumber.min(remainingOrderShares, ask.amount);
          fullPrecisionPrice = (scalarMinMax && scalarMinMax.minValue) ?
            abacus.shrinkScalarPrice(scalarMinMax.minValue, ask.fullPrecisionPrice) :
            ask.fullPrecisionPrice;
          tradingCost = abacus.calculateFxpTradingCost(orderSharesFilled, fullPrecisionPrice, fees.tradingFee, fees.makerProportionOfFee, range);
          totalTakerFeeEth = totalTakerFeeEth.plus(tradingCost.fee);
          etherToTrade = etherToTrade.plus(tradingCost.cost);
          remainingOrderShares = remainingOrderShares.minus(orderSharesFilled);
          if (remainingOrderShares.lte(constants.PRECISION.zero)) {
            break;
          }
        }
        buyActions.push(augur.getBuyAction(etherToTrade, orderShares.minus(remainingOrderShares), totalTakerFeeEth, gasPrice));
        if (!remainingOrderShares.lte(constants.PRECISION.zero) && !isMarketOrder) {
          buyActions.push(augur.getBidAction(abi.fix(remainingOrderShares), abi.fix(orderLimitPrice), adjustedFees.maker, gasPrice));
        }
        tradingActions = this.calculateTradeTotals(type, orderShares.toFixed(), orderLimitPrice && orderLimitPrice.toFixed(), buyActions);
      }
    } else {
      matchingSortedBids = augur.filterByPriceAndOutcomeAndUserSortByPrice(marketOrderBook.buy, type, orderLimitPrice, outcomeId, userAddress);
      areSuitableBids = matchingSortedBids.length > 0;
      userHasPosition = userPositionShares.gt(constants.PRECISION.zero);
      sellActions = [];
      if (userHasPosition) {
        etherToSell = constants.ZERO;
        remainingOrderShares = orderShares;
        remainingPositionShares = userPositionShares;
        if (areSuitableBids) {
          totalTakerFeeEth = constants.ZERO;
          for (i = 0, length = matchingSortedBids.length; i < length; i++) {
            bid = matchingSortedBids[i];
            bidAmount = new BigNumber(bid.amount, 10);
            orderSharesFilled = BigNumber.min(bidAmount, remainingOrderShares, remainingPositionShares);
            fullPrecisionPrice = (scalarMinMax && scalarMinMax.minValue) ?
              abacus.shrinkScalarPrice(scalarMinMax.minValue, bid.fullPrecisionPrice) :
              bid.fullPrecisionPrice;
            tradingCost = abacus.calculateFxpTradingCost(orderSharesFilled, fullPrecisionPrice, fees.tradingFee, fees.makerProportionOfFee, range);
            totalTakerFeeEth = totalTakerFeeEth.plus(tradingCost.fee);
            etherToSell = etherToSell.plus(tradingCost.cash);
            remainingOrderShares = remainingOrderShares.minus(orderSharesFilled);
            remainingPositionShares = remainingPositionShares.minus(orderSharesFilled);
            if (orderSharesFilled.equals(bidAmount)) {
              // since this order is filled we remove it. Change for-cycle variables accordingly
              matchingSortedBids.splice(i, 1);
              i--;
              length--;
            } else {
              newBid = clone(bid);
              newBid.amount = bidAmount.minus(orderSharesFilled).toFixed();
              matchingSortedBids[i] = newBid;
            }
            if (remainingOrderShares.lte(constants.PRECISION.zero) || remainingPositionShares.lte(constants.PRECISION.zero)) {
              break;
            }
          }
          sellActions.push(augur.getSellAction(etherToSell, orderShares.minus(remainingOrderShares), totalTakerFeeEth, gasPrice));
        } else {
          if (!isMarketOrder) {
            askShares = BigNumber.min(remainingOrderShares, remainingPositionShares);
            remainingOrderShares = remainingOrderShares.minus(askShares);
            remainingPositionShares = remainingPositionShares.minus(askShares);
            sellActions.push(augur.getAskAction(abi.fix(askShares), abi.fix(adjustedLimitPrice), adjustedFees.maker, gasPrice));
          }
        }
        if (remainingOrderShares.gt(constants.PRECISION.zero) && !isMarketOrder) {
          // recursion
          newTradeActions = augur.getTradingActions(type, remainingOrderShares, orderLimitPrice, takerFee, makerFee, userAddress, remainingPositionShares, outcomeId, range, {buy: matchingSortedBids}, scalarMinMax);
          if (newTradeActions.tradeActions) {
            sellActions = sellActions.concat(newTradeActions.tradeActions);
          } else {
            sellActions = sellActions.concat(newTradeActions);
          }
        }
      } else {
        if (isMarketOrder) {
          tradingActions = this.calculateTradeTotals(type, orderShares.toFixed(), orderLimitPrice && orderLimitPrice.toFixed(), sellActions);
        } else {
          etherToShortSell = constants.ZERO;
          remainingOrderShares = orderShares;
          if (areSuitableBids) {
            totalTakerFeeEth = constants.ZERO;
            for (i = 0, length = matchingSortedBids.length; i < length; i++) {
              bid = matchingSortedBids[i];
              orderSharesFilled = BigNumber.min(new BigNumber(bid.amount, 10), remainingOrderShares);
              fullPrecisionPrice = (scalarMinMax && scalarMinMax.maxValue !== null && scalarMinMax.maxValue !== undefined) ?
                abacus.adjustScalarSellPrice(scalarMinMax.maxValue, bid.fullPrecisionPrice) :
                bid.fullPrecisionPrice;
              tradingCost = abacus.calculateFxpTradingCost(orderSharesFilled, fullPrecisionPrice, fees.tradingFee, fees.makerProportionOfFee, range);
              totalTakerFeeEth = totalTakerFeeEth.plus(tradingCost.fee);
              remainingOrderShares = remainingOrderShares.minus(orderSharesFilled);
              if (scalarMinMax && scalarMinMax.maxValue) {
                orderSharesFilled = new BigNumber(scalarMinMax.maxValue, 10).times(orderSharesFilled);
              }
              etherToShortSell = etherToShortSell.plus(orderSharesFilled.minus(tradingCost.cash));
              if (remainingOrderShares.lte(constants.PRECISION.zero)) {
                break;
              }
            }
            sellActions.push(augur.getShortSellAction(etherToShortSell, orderShares.minus(remainingOrderShares), totalTakerFeeEth, gasPrice));
          }
          if (remainingOrderShares.gt(constants.PRECISION.zero)) {
            sellActions.push(augur.getShortAskAction(abi.fix(remainingOrderShares), abi.fix(adjustedLimitPrice), adjustedFees.maker, gasPrice));
          }
        }
      }
      tradingActions = this.calculateTradeTotals(type, orderShares.toFixed(), orderLimitPrice && orderLimitPrice.toFixed(), sellActions);
    }
    return tradingActions;
  }
};
