#!/usr/bin/env node
/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var chalk = require("chalk");
var assert = require("chai").assert;
var log = console.log;
var Augur = require("../src/utilities").setup(require("../src/augur"), process.argv.slice(2));

function check_quorum() {
    Augur.checkQuorum(branch,
        function (r) {
            // sent
        },
        function (r) {
            // success
            setTimeout(function () {
                if (r && r.callReturn && r.callReturn !== "1") {
                    var this_period = Augur.getVotePeriod(branch);
                    if (this_period < period) {
                        log(chalk.gray("  - Vote period:"), chalk.green(this_period));
                        check_quorum();
                    } else {
                        log(chalk.red.bold("Reached vote period " + period + "!"));
                    }
                } else {
                    log(chalk.gray("Check quorum: ") + chalk.green(r.callReturn));
                }
            }, 2500);
        },
        function (r) {
            // failed
            throw("Check quorum failed");
        }
    );
}

log(chalk.blue.bold("Fast forward..."));

var branch = Augur.branches.dev;
var events, period;
for (var i = 0; i < 200; ++i) {
    events = Augur.getEvents(branch, i);
    if (events && events.length && events.length > 1) {
        log(chalk.cyan("Found ") + chalk.green(events.length) +
            chalk.cyan(" events in vote period ") + chalk.green(i));
        log(chalk.gray(JSON.stringify(events,null,2)));
        period = i;
        break;
    }
}

log(chalk.cyan("Fast forward to vote period ") + chalk.green(period));
check_quorum();