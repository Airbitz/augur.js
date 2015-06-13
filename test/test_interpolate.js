/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("assert");
var Augur = require("../augur");
var constants = require("./constants");
require('it-each')({ testPerIteration: true });

Augur.connect();

var log = console.log;
var TIMEOUT = 240000;

var branch = Augur.branches.dev;
var period = Augur.getVotePeriod(branch);
var num_events = Augur.getNumberEvents(branch, period);
var num_reports = Augur.getNumberReporters(branch);
var flatsize = num_events * num_reports;
var reporters = [
    "0x639b41c4d3d399894f2a57894278e1653e7cd24c",
    "0x05ae1d0ca6206c6168b42efcd1fbe0ed144e821b",
    "0x4a0cf714e2c1b785ff2d650320acf63be9eb25c6"
];
var reputation_vector = [];
for (var i = 0; i < num_reports; ++i) {
    reputation_vector.push(Augur.getRepBalance(branch, reporters[i]));
}
log(reputation_vector);
var ballot = new Array(num_events);
var reports = new Array(flatsize);
for (var i = 0; i < num_reports; ++i) {
    var reporterID = Augur.getReporterID(branch, i);
    ballot = Augur.getReporterBallot(branch, period, reporterID);
    if (ballot[0] != 0) {
        for (var j = 0; j < num_events; ++j) {
            reports[i*num_events + j] = ballot[j];
        }
    } else {
        for (var j = 0; j < num_events; ++j) {
            reports[i*num_events + j] = '0';
        }
    }
}
// log(reports);
var scaled = [];
var scaled_min = [];
var scaled_max = [];
for (var i = 0; i < num_events; ++i) {
    scaled.push(0);
    scaled_min.push(1);
    scaled_max.push(2);
}

describe("testing consensus/interpolate", function () {

    it("interpolate", function (done) {
        this.timeout(TIMEOUT);
        assert.equal(reports.length, flatsize);
        assert.equal(reputation_vector.length, num_reports);
        assert.equal(scaled.length, num_events);
        assert.equal(scaled_max.length, num_events);
        assert.equal(scaled_min.length, num_events);
        log("Reports:");
        log(Augur.fold(reports, num_events));
        log("Reputation:");
        log(reputation_vector);
        log("Scaled:");
        log(scaled);
        log("Scaled max:");
        log(scaled_max);
        log("Scaled min:");
        log(scaled_min);
        Augur.interpolate(
            reports,
            reputation_vector,
            scaled,
            scaled_max,
            scaled_min,
            function (r) {
                // sent
                log(Augur.fold(Augur.unfix(r.callReturn, "number"), num_events));
            },
            function (r) {
                // success
                var interpolated = Augur.unfix(r.callReturn, "number");
                var reports_filled = Augur.fold(interpolated.slice(0, flatsize), num_events);
                var reports_mask = Augur.fold(interpolated.slice(flatsize, 2*flatsize), num_events);
                log("reports (filled):\n", reports_filled);
                log("reports mask:\n", reports_mask);
                done();
            },
            function (r) {
                //failed
                log("interpolate failed:", r);
                done();
            }
        );
    });

    it("redeem_interpolate", function (done) {
        this.timeout(TIMEOUT);
        Augur.redeem_interpolate(
            branch,
            period,
            num_events,
            num_reports,
            flatsize,
            function (r) {
                // sent
            },
            function (r) {
                // success
                // var i, reports_filled, reports_mask, v_size;
                assert.equal(r.callReturn, "0x01");
                // reports_filled = Augur.getReportsFilled(branch, period);
                // for (i = 0; i < num_events; ++i) {
                //     assert.equal(reports_filled[i], Augur.fix(ballot[i], "string"));
                // }
                // reports_mask = Augur.getReportsMask(branch, period);
                // for (i = 0; i < num_events; ++i) {
                //     assert.equal(reports_mask[i], "0");
                // }
                // v_size = Augur.getVSize(branch, period);
                // assert.equal(parseInt(v_size), num_reports * num_events);
                done();
            },
            function (r) {
                // failed
                log("redeem_interpolate failed:", r);
                done();
            }
        );
    });
});