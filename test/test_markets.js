/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var BigNumber = require("bignumber.js");
var assert = require("assert");
var Augur = require("../augur");
var constants = require("./constants");

Augur.connect();

// Augur.BigNumberOnly = true;

var log = console.log;

function array_equal(a, b) {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}
function gteq0(n) { return (parseFloat(n) >= 0); }
function is_array(r) {
    assert(r.constructor === Array);
    assert(r.length > 0);
}
function is_object(r) {
    assert(r.constructor === Object);
}
function is_empty(o) {
    for (var i in o) {
        if (o.hasOwnProperty(i)) return false;
    }
    return true;
}
function on_root_branch(r) {
    assert(r.branch === Augur.branches.dev);
}
function is_not_zero(r) {
    assert(r.id !== "0" && r.id !== "0x" && r.id !== "0x0" && parseInt(r) !== 0);
}

var amount = "1";
var branch_id = Augur.branches.dev;
var participant_id = constants.accounts.jack;
var participant_number = "1";
var outcome = Augur.NO.toString();

var markets = Augur.getMarkets(branch_id);
var market_id = markets[0];

// markets.se
describe("markets.se", function () {
    describe("getSimulatedBuy(" + market_id + ", " + outcome + ", " + amount + ")", function () {
        var test = function (r) {
            log(r);
        };
        it("sync", function () {
            test(Augur.getSimulatedBuy(market_id, outcome, amount));
        });
        it("async", function (done) {
            Augur.getSimulatedBuy(market_id, outcome, amount, function (r) {
                test(r); done();
            });
        });
    });
    describe("getSimulatedSell(" + market_id + ", " + outcome + ", " + amount + ")", function () {
        var test = function (r) {
            log(r);
        };
        it("sync", function () {
            test(Augur.getSimulatedSell(market_id, outcome, amount));
        });
        it("async", function (done) {
            Augur.getSimulatedSell(market_id, outcome, amount, function (r) {
                test(r); done();
            });
        });
    });
    describe("lsLmsr", function () {
        var test = function (r) {
            assert(Augur.bignum(r).toNumber() > 0);
        };
        it("sync", function () {
            test(Augur.lsLmsr(market_id));
        });
        it("async", function (done) {
            Augur.lsLmsr(market_id, function (r) {
                test(r); done();
            });
        });
    });
    // describe("getMarketInfo", function () {
    //     var marketInfo = Augur.getMarketInfo(market_id);
    //     it("should have 2 outcomes", function () {
    //         assert.equal("2", marketInfo.numOutcomes);
    //     });
    //     it("should have description '" + market_info_1.description + "'", function () {
    //         assert.equal(market_info_1.description, marketInfo.description);
    //     });
    // });
    // describe("getMarketInfo(" + market_id + ")", function () {
    //     var test = function (r) {
    //         assert.equal(r.description, market_info_1.description);
    //     };
    //     it("sync", function () {
    //         test(Augur.getMarketInfo(market_id));
    //     });
    //     it("async", function (done) {
    //         Augur.getMarketInfo(market_id, function (r) {
    //             test(r); done();
    //         });
    //     });
    // });
    // describe("getMarketInfo(" + market_id2 + ")", function () {
    //     var test = function (r) {
    //         assert.equal(r.description, market_info_2.description);
    //     };
    //     it("sync", function () {
    //         test(Augur.getMarketInfo(market_id2));
    //     });
    //     it("async", function (done) {
    //         Augur.getMarketInfo(market_id2, function (r) {
    //             test(r); done();
    //         });
    //     });
    // });
    describe("getMarketEvents(" + market_id + ")", function () {
        function test(r) {
            assert.equal(r.constructor, Array);
            assert(array_equal(r, [ event_id ]));
        }
        it("sync", function () {
            test(Augur.getMarketEvents(market_id));
        });
        it("async", function (done) {
            Augur.getMarketEvents(market_id, function (r) {
                test(r); done();
            });
        });
    });
    describe("getNumEvents(" + market_id + ") === '1'", function () {
        var test = function (r) {
            assert.equal(r, "1");
        };
        it("sync", function () {
            test(Augur.getNumEvents(market_id));
        });
        it("async", function (done) {
            Augur.getNumEvents(market_id, function (r) {
                test(r); done();
            });
        });
    });
    describe("getBranchID(" + market_id + ")", function () {
        var test = function (r) {
            assert.equal(r, "0x0f69b5");
        };
        it("sync", function () {
            test(Augur.getBranchID(market_id));
        });
        it("async", function (done) {
            Augur.getBranchID(market_id, function (r) {
                test(r); done();
            });
        });
    });
    describe("getCurrentParticipantNumber(" + market_id + ") >= 0", function () {
        var test = function (r) {
            gteq0(r);
        };
        it("sync", function () {
            test(Augur.getCurrentParticipantNumber(market_id));
        });
        it("async", function (done) {
            Augur.getCurrentParticipantNumber(market_id, function (r) {
                test(r); done();
            });
        });
    });
    describe("getMarketNumOutcomes(" + market_id + ") ", function () {
        var test = function (r) {
            assert.equal(r, "2");
        };
        it("sync", function () {
            test(Augur.getMarketNumOutcomes(market_id));
        });
        it("async", function (done) {
            Augur.getMarketNumOutcomes(market_id, function (r) {
                test(r); done();
            });
        });
    });
    describe("getParticipantSharesPurchased(" + market_id + ", " + participant_number + "," + outcome + ") ", function () {
        var test = function (r) {
            gteq0(r);
        };
        it("sync", function () {
            test(Augur.getParticipantSharesPurchased(market_id, participant_number, outcome));
        });
        it("async", function (done) {
            Augur.getParticipantSharesPurchased(market_id, participant_number, outcome, function (r) {
                test(r); done();
            });
        });
    });
    describe("getSharesPurchased(" + market_id + ", " + outcome + ") ", function () {
        var test = function (r) {
            gteq0(r);
        };
        it("sync", function () {
            test(Augur.getSharesPurchased(market_id, outcome));
        });
        it("async", function (done) {
            Augur.getSharesPurchased(market_id, outcome, function (r) {
                test(r); done();
            });
        });
    });
    describe("getWinningOutcomes(" + market_id + ")", function () {
        var test = function (r) {
            // log(r);
            is_array(r);
        };
        it("sync", function () {
            test(Augur.getWinningOutcomes(market_id));
        });
        it("async", function (done) {
            Augur.getWinningOutcomes(market_id, function (r) {
                test(r); done();
            });
        });
    });
    describe("price(" + market_id + ", " + outcome + ") ", function () {
        var test = function (r) {
            assert(parseFloat(r) >= 0.0);
            assert(parseFloat(r) <= 1.0);
        };
        it("sync", function () {
            test(Augur.price(market_id, outcome));
        });
        it("async", function (done) {
            Augur.price(market_id, outcome, function (r) {
                test(r); done();
            });
        });
    });
    describe("getParticipantNumber(" + market_id + ", " + constants.accounts.jack + ") ", function () {
        var test = function (r) {
            gteq0(r);
        };
        it("sync", function () {
            test(Augur.getParticipantNumber(market_id, constants.accounts.jack));
        });
        it("async", function (done) {
            Augur.getParticipantNumber(market_id, constants.accounts.jack, function (r) {
                test(r); done();
            });
        });
    });
    describe("getParticipantID(" + market_id + ", " + participant_number + ") ", function () {
        var test = function (r) {
            log(r);
        };
        it("sync", function () {
            test(Augur.getParticipantID(market_id, participant_number));
        });
        it("async", function (done) {
            Augur.getParticipantID(market_id, participant_number, function (r) {
                test(r); done();
            });
        });
    });
    describe("getAlpha(" + market_id + ") ", function () {
        var test = function (r) {
            assert.equal(parseFloat(r).toFixed(6), "0.007900");
        };
        it("sync", function () {
            test(Augur.getAlpha(market_id));
        });
        it("async", function (done) {
            Augur.getAlpha(market_id, function (r) {
                test(r); done();
            });
        });
    });
    describe("getCumScale(" + market_id + ") ", function () {
        var test = function (r) {
            assert.equal(r, "0.00000000000000000005");
        };
        it("sync", function () {
            test(Augur.getCumScale(market_id));
        });
        it("async", function (done) {
            Augur.getCumScale(market_id, function (r) {
                test(r); done();
            });
        });
    });
    describe("getTradingPeriod(" + market_id + ") ", function () {
        var test = function (r) {
            assert.equal(r, "24607");
        };
        it("sync", function () {
            test(Augur.getTradingPeriod(market_id));
        });
        it("async", function (done) {
            Augur.getTradingPeriod(market_id, function (r) {
                test(r); done();
            });
        });
    });
    describe("getTradingFee(" + market_id + ") ", function () {
        var test = function (r) {
            assert.equal(r, "0.01999999999999999998");
        };
        it("sync", function () {
            test(Augur.getTradingFee(market_id));
        });
        it("async", function (done) {
            Augur.getTradingFee(market_id, function (r) {
                test(r); done();
            });
        });
    });
});