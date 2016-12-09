/**
 * Filters / logging
 */

"use strict";

var async = require("async");
var clone = require("clone");
var abi = require("augur-abi");
var augur_contracts = require("augur-contracts");
var utils = require("./utilities");
var constants = require("./constants");
var errors = augur_contracts.errors;

// non-event filters
var filters = {
    block: {id: null, heartbeat: null},
    contracts: {id: null, heartbeat: null}
};

// event filters
var events_api = new augur_contracts.Tx().events;
for (var label in events_api) {
    if (!events_api.hasOwnProperty(label)) continue;
    filters[label] = {id: null, heartbeat: null};
}

module.exports = function () {

    var augur = this;

    return {

        PULSE: constants.SECONDS_PER_BLOCK * 500,

        filter: filters,

        format_trade_type: function (type) {
            return (parseInt(type, 16) === 1) ? "buy" : "sell";
        },
        format_event_message: function (label, msg) {
            var fmt;
            switch (label) {
            case "tradingFeeUpdated":
                fmt = clone(msg);
                fmt.tradingFee = abi.unfix(msg.tradingFee, "string");
                return fmt;
            case "log_fill_tx":
                fmt = clone(msg);
                fmt.type = this.format_trade_type(msg.type);
                fmt.taker = abi.format_address(msg.sender);
                fmt.maker = abi.format_address(msg.owner);
                fmt.amount = abi.unfix(msg.amount, "string");
                fmt.price = abi.unfix(abi.hex(msg.price, true), "string");
                fmt.takerFee = abi.unfix(msg.takerFee, "string");
                fmt.makerFee = abi.unfix(msg.makerFee, "string");
                fmt.onChainPrice = abi.unfix(abi.hex(msg.onChainPrice, true), "string");
                fmt.outcome = parseInt(msg.outcome, 16);
                fmt.timestamp = parseInt(msg.timestamp, 16);
                delete fmt.sender;
                delete fmt.owner;
                return fmt;
            case "log_add_tx":
                fmt = clone(msg);
                fmt.type = this.format_trade_type(msg.type);
                fmt.maker = abi.format_address(msg.sender);
                fmt.price = abi.unfix(abi.hex(msg.price, true), "string");
                fmt.amount = abi.unfix(msg.amount, "string");
                fmt.outcome = parseInt(msg.outcome, 16);
                delete fmt.sender;
                return fmt;
            default:
                return msg;
            }
        },
        parse_event_message: function (label, msg, onMessage) {
            var i;
            if (msg) {
                switch (msg.constructor) {
                case Array:
                    for (i = 0; i < msg.length; ++i) {
                        this.parse_event_message(label, msg[i], onMessage);
                    }
                    break;
                case Object:
                    if (!msg.error && msg.topics && msg.data) {
                        var inputs = augur.api.events[label].inputs;
                        var parsed = {};
                        var topicIndex = 0;
                        var dataIndex = 0;
                        var topics = msg.topics;
                        var numIndexed = topics.length - 1;
                        var data = augur.rpc.unmarshal(msg.data);
                        if (data && data.constructor !== Array) data = [data];
                        for (i = 0; i < inputs.length; ++i) {
                            parsed[inputs[i].name] = 0;
                            if (inputs[i].indexed) {
                                parsed[inputs[i].name] = topics[topicIndex + 1];
                                ++topicIndex;
                            } else {
                                parsed[inputs[i].name] = data[dataIndex];
                                ++dataIndex;
                            }
                        }
                        parsed.blockNumber = parseInt(msg.blockNumber, 16);
                        onMessage(this.format_event_message(label, parsed));
                    }
                    break;
                default:
                    console.error("unknown event message:", msg);
                }
            }
        },
        parse_block_message: function (message, onMessage) {
            if (message) {
                if (message.length && message.constructor === Array) {
                    for (var i = 0, len = message.length; i < len; ++i) {
                        if (message[i] && message[i].number) {
                            onMessage(message[i].number);
                        } else {
                            onMessage(message[i]);
                        }
                    }
                } else if (message.number) {
                    onMessage(message.number);
                }
            }
        },
        parse_contracts_message: function (message, onMessage) {
            if (message && message.length && message.constructor === Array) {
                for (var i = 0, len = message.length; i < len; ++i) {
                    if (message[i]) {
                        if (message[i].constructor === Object && message[i].data) {
                            message[i].data = augur.rpc.unmarshal(message[i].data);
                        }
                        onMessage(message[i]);
                    }
                }
            }
        },
        poll_filter: function (label, onMessage) {
            var callback, self = this;
            if (this.filter[label]) {
                switch (label) {
                case "contracts":
                    callback = function (msg) {
                        self.parse_contracts_message(msg, onMessage);
                    };
                    break;
                case "block":
                    callback = function (msg) {
                        self.parse_block_message(msg, onMessage);
                    };
                    break;
                default:
                    callback = function (msg) {
                        self.parse_event_message(label, msg, onMessage);
                    };
                }
                augur.rpc.getFilterChanges(this.filter[label].id, callback);
            }
        },

        // clear/uninstall filters
        clear_filter: function (label, cb) {
            if (utils.is_function(cb)) {
                var self = this;
                this.unsubscribe(this.filter[label].id, function (uninst) {
                    self.filter[label].id = null;
                    cb(uninst);
                });
            } else {
                var uninst = this.unsubscribe(this.filter[label].id);
                this.filter[label].id = null;
                return uninst;
            }
        },

        // set up filters
        setup_event_filter: function (contract, label, f) {
            return this.subscribeLogs({
                address: augur.contracts[contract],
                topics: [augur.api.events[label].signature]
            }, f);
        },
        setup_contracts_filter: function (f) {
            var self = this;
            var contract_list = [];
            for (var c in augur.contracts) {
                if (!augur.contracts.hasOwnProperty(c)) continue;
                contract_list.push(augur.contracts[c]);
            }
            var params = {
                address: contract_list,
                fromBlock: "0x01",
                toBlock: "latest"
            };
            if (!utils.is_function(f)) {
                this.filter.contracts = {
                    id: this.subscribeLogs(params),
                    heartbeat: null
                };
                return this.filter.contracts;
            }
            this.subscribeLogs(params, function (filter_id) {
                self.filter.contracts = {
                    id: filter_id,
                    heartbeat: null
                };
                f(self.filter.contracts);
            });
        },
        setup_block_filter: function (f) {
            var self = this;
            if (!utils.is_function(f)) {
                this.filter.block = {
                    id: this.subscribeNewBlocks(),
                    heartbeat: null
                };
                return this.filter.block;
            }
            this.subscribeNewBlocks(function (filter_id) {
                self.filter.block = {id: filter_id, heartbeat: null};
                f(self.filter.block);
            });
        },

        // start listeners
        start_event_listener: function (label, cb) {
            var self = this;
            var contract = augur.api.events[label].contract;
            if (this.filter[label] && this.filter[label].id) {
                if (!utils.is_function(cb)) return this.filter[label].id;
                return cb(this.filter[label].id);
            }
            if (!utils.is_function(cb)) {
                var filter_id = this.setup_event_filter(contract, label);
                if (!filter_id || filter_id === "0x") {
                    return errors.FILTER_NOT_CREATED;
                }
                if (filter_id.error) return filter_id;
                self.filter[label] = {
                    id: filter_id,
                    heartbeat: null
                };
                return filter_id;
            }
            this.setup_event_filter(contract, label, function (filter_id) {
                if (!filter_id || filter_id === "0x") {
                    return cb(errors.FILTER_NOT_CREATED);
                }
                if (filter_id.error) return cb(filter_id);
                self.filter[label] = {
                    id: filter_id,
                    heartbeat: null
                };
                cb(filter_id);
            });
        },
        start_contracts_listener: function (cb) {
            if (this.filter.contracts.id === null) {
                if (!utils.is_function(cb)) {
                    return this.setup_contracts_filter();
                }
                this.setup_contracts_filter(cb);
            }
        },
        start_block_listener: function (cb) {
            if (this.filter.block.id === null) {
                if (!utils.is_function(cb)) {
                    return this.setup_block_filter();
                }
                this.setup_block_filter(cb);
            }
        },

        // start/stop polling
        pacemaker: function (cb) {
            var self = this;
            if (!cb || cb.constructor !== Object) return;
            if (!augur.rpc.wsUrl && !augur.rpc.ipcpath) {
                async.forEachOf(this.filter, function (filter, label, next) {
                    if (utils.is_function(cb[label])) {
                        self.poll_filter(label, cb[label]);
                        self.filter[label].heartbeat = setInterval(function () {
                            self.poll_filter(label, cb[label]);
                        }, self.PULSE);
                    }
                    next();
                });
            } else {
                async.forEachOf(this.filter, function (filter, label, next) {
                    if (utils.is_function(cb[label])) {
                        var callback = cb[label];
                        switch (label) {
                        case "contracts":
                            cb[label] = function (msg) {
                                self.parse_contracts_message(msg, callback);
                            };
                            break;
                        case "block":
                            cb[label] = function (msg) {
                                self.parse_block_message(msg, callback);
                            };
                            break;
                        default:
                            cb[label] = function (msg) {
                                self.parse_event_message(label, msg, callback);
                            };
                        }
                        augur.rpc.registerSubscriptionCallback(self.filter[label].id, cb[label]);
                        next();
                    }
                });
            }
        },

        listen: function (cb, setup_complete) {
            var self = this;

            function listenHelper(callback, label, next) {
                switch (label) {
                case "contracts":
                    self.start_contracts_listener(function () {
                        self.pacemaker({contracts: callback});
                        next(null, [label, self.filter[label].id]);
                    });
                    break;
                case "block":
                    self.start_block_listener(function () {
                        self.pacemaker({block: callback});
                        next(null, [label, self.filter[label].id]);
                    });
                    break;
                default:
                    self.start_event_listener(label, function () {
                        var p = {};
                        p[label] = callback;
                        self.pacemaker(p);
                        next(null, [label, self.filter[label].id]);
                    });
                }
            }

            if (!augur.rpc.wsUrl && !augur.rpc.ipcpath) {
                this.subscribeLogs = augur.rpc.newFilter.bind(augur.rpc);
                this.subscribeNewBlocks = augur.rpc.newBlockFilter.bind(augur.rpc);
                this.unsubscribe = augur.rpc.uninstallFilter.bind(augur.rpc);
            } else {
                this.subscribeLogs = augur.rpc.subscribeLogs.bind(augur.rpc);
                this.subscribeNewBlocks = augur.rpc.subscribeNewHeads.bind(augur.rpc);
                this.unsubscribe = augur.rpc.unsubscribe.bind(augur.rpc);
            }
            async.forEachOfSeries(cb, function (callback, label, next) {

                // skip invalid labels, undefined callbacks
                if (!self.filter[label] || !callback) {
                    next(null, null);
                } else if (self.filter[label].id === null && callback) {
                    listenHelper(callback, label, next);

                // callback already registered. uninstall, and reinstall new callback.
                } else if (self.filter[label].id && callback) {
                    if (augur.rpc.wsUrl || augur.rpc.ipcpath) {
                        augur.rpc.unregisterSubscriptionCallback(self.filter[label].id);
                    }
                    self.clear_filter(label, function () {
                        listenHelper(callback, label, next);
                    });
                }
            }, function (err) {
                if (err) console.error(err);
                augur.rpc.customSubscriptionCallback = cb;
                augur.rpc.resetCustomSubscription = function () {
                    self.listen(augur.rpc.customSubscriptionCallback);
                }.bind(self);
                if (utils.is_function(setup_complete)) setup_complete(self.filter);
            });
        },

        all_filters_removed: function () {
            var f, isRemoved = true;
            for (var label in this.filter) {
                if (!this.filter.hasOwnProperty(label)) continue;
                f = this.filter[label];
                if (f.heartbeat !== null || f.id !== null) {
                    isRemoved = false;
                    break;
                }
            }
            return isRemoved;
        },

        ignore: function (uninstall, cb, complete) {
            var label, self = this;
            augur.rpc.resetCustomSubscription = null;

            function cleared(uninst, callback, complete) {
                callback(uninst);
                if (uninst && uninst.constructor === Object) {
                    return complete(uninst);
                }
                if (self.all_filters_removed()) complete();
            }

            if (!complete && utils.is_function(cb)) {
                complete = cb;
                cb = null;
            }
            if (uninstall && uninstall.constructor === Object) {
                cb = {};
                for (label in this.filter) {
                    if (!this.filter.hasOwnProperty(label)) continue;
                    if (utils.is_function(uninstall[label])) {
                        cb[label] = uninstall[label];
                    }
                }
                uninstall = false;
            }
            cb = cb || {}; // individual filter removal callbacks
            for (label in this.filter) {
                if (!this.filter.hasOwnProperty(label)) continue;
                cb[label] = utils.is_function(cb[label]) ? cb[label] : utils.noop;
            }
            complete = utils.is_function(complete) ? complete : utils.noop; // after all filters removed
            for (label in this.filter) {
                if (!this.filter.hasOwnProperty(label)) continue;
                if (this.filter[label].heartbeat !== null) {
                    clearInterval(this.filter[label].heartbeat);
                    this.filter[label].heartbeat = null;
                    if (!uninstall && utils.is_function(cb[label])) {
                        cb[label]();
                        if (this.all_filters_removed()) complete();
                    }
                }
            }
            if (uninstall) {
                async.forEachOfSeries(this.filter, function (filter, label, next) {
                    if (filter.id === null) return next();
                    if (augur.rpc.wsUrl || augur.rpc.ipcpath) {
                        augur.rpc.unregisterSubscriptionCallback(self.filter[label].id);
                    }
                    self.clear_filter(label, function (uninst) {
                        cleared(uninst, cb[label], complete);
                        next();
                    });
                });
            }
        }
    };
};
