/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("assert");
var Augur = require("../augur");
var constants = require("./constants");

Augur.connect();

var log = console.log;
var TIMEOUT = 120000;

var branch = Augur.branches.dev;
var period = Augur.getVotePeriod(branch);
var num_events = Augur.getNumberEvents(branch, period);
var num_reports = Augur.getNumberReporters(branch);
var step = Augur.getStep(branch);
var substep = Augur.getSubstep(branch);
var num_events = Augur.getNumberEvents(branch, period);
var num_reports = Augur.getNumberReporters(branch);
var flatsize = num_events * num_reports;

describe("set reporter ballots", function () {

    it("set coinbase report", function (done) {

        var i, ballot, reputation;

        this.timeout(TIMEOUT);
        ballot = new Array(num_events);
        for (i = 0; i < num_events; ++i) {
            ballot[i] = Math.random();
            if (ballot[i] > 0.6) {
                ballot[i] = 2.0;
            } else if (ballot[i] >= 0.4) {
                ballot[i] = 1.5;
            } else {
                ballot[i] = 1.0;
            }
        }
        reputation = Augur.getRepBalance(branch, Augur.coinbase);
        assert.equal(Augur.getReporterID(branch, 0), Augur.coinbase);
        Augur.setReporterBallot(
            branch,
            period,
            Augur.coinbase,
            ballot,
            reputation,
            function (r) {
                // sent
                // console.log("sent: ", r);
            },
            function (r) {
                // success
                // console.log("success:", r);
                done();
            },
            function (r) {
                // failed
                throw("failed: " + r);
                done();
            }
        );
    });

    it("set secondary report", function (done) {

        var i, ballot, reputation;

        this.timeout(TIMEOUT);
        ballot = new Array(num_events);
        for (i = 0; i < num_events; ++i) {
            ballot[i] = Math.random();
            if (ballot[i] > 0.6) {
                ballot[i] = 2.0;
            } else if (ballot[i] >= 0.4) {
                ballot[i] = 1.5;
            } else {
                ballot[i] = 1.0;
            }
        }
        reputation = Augur.getRepBalance(
            branch,
            constants.chain10101.accounts.tinybike_new
        );
        assert.equal(
            Augur.getReporterID(branch, 1),
            constants.chain10101.accounts.tinybike_new
        );
        Augur.setReporterBallot(
            branch,
            period,
            constants.chain10101.accounts.tinybike_new,
            ballot,
            reputation,
            function (r) {
                // sent
                // log("sent: ", r);
            },
            function (r) {
                // success
                // log("success:", r);
                done();
            },
            function (r) {
                // failed
                throw("failed: " + r);
                done();
            }
        );
    });
});
