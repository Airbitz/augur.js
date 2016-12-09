/**
 * Logging/filter tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("chai").assert;
var abi = require("augur-abi");
var api = new require("augur-contracts").Tx();
var tools = require("../../tools");
var constants = require("../../../src/constants");
var augurpath = "../../../src/index";
var augur = require(augurpath);

var DEBUG = false;
var DELAY = 2500;

describe("parse_block_message", function () {
    var test = function (msg) {
        it(JSON.stringify(msg), function (done) {
            augur.filters.parse_block_message(msg, function (parsed) {
                if (DEBUG) console.log("parse_block_message:", parsed);
                done();
            });
        });
    };
    test({
        difficulty: '0x46015d94',
        extraData: '0xd783010500844765746887676f312e352e31856c696e7578',
        gasLimit: '0x47e7c4',
        gasUsed: '0xa410',
        hash: '0x96a9e1fd64969355521cbfd125569d6bb0088f36685200db58b77ca7a7fbebd6',
        logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        miner: '0xdf712c685be75739eb44cb6665f92129e45864e4',
        nonce: '0x32894b6becfa3b8e',
        number: '0x11941a',
        parentHash: '0xeada45540e0e1505ac0b6759e429ce8dc24a65c6e4c9bc3346a0cd3f22297d1e',
        receiptRoot: '0x204590761a4d9f825ebf97f82f663979e78ce7caab303688bc6815e62b5f012b',
        sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        size: '0x302',
        stateRoot: '0x381b58ccdb2a890a89b9f7e6110429acadb2884199962497a267ef3b054e3c52',
        timestamp: '0x576469fe',
        totalDifficulty: '0xf109f9a4e6f3',
        transactionsRoot: '0x4f90d1155e24c3e52f0c44c6e1b5eafa4395e196339749d0453600017627df4e',
        uncles: []
    });
    test({
        difficulty: '0x45c62a5a',
        extraData: '0xd783010500844765746887676f312e352e31856c696e7578',
        gasLimit: '0x47e7c4',
        gasUsed: '0x0',
        hash: '0xa4cd3abb9124548b39454f8a26d52edc1ba0df5e7ae026430b123829e58b31e9',
        logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        miner: '0xdf712c685be75739eb44cb6665f92129e45864e4',
        nonce: '0x179b12d04951c04b',
        number: '0x11961c',
        parentHash: '0x1272370c853752237b18561f6409f24a486ff1b842189d2e6c264b2c8b5de043',
        receiptRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
        sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        size: '0x21b',
        stateRoot: '0x571ee6e9fc9845031a13ff885db64249405dec8fde94d6520488214f09722760',
        timestamp: '0x57648769',
        totalDifficulty: '0xf196b3653c38',
        transactionsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
        uncles: []
    });
    test({
        difficulty: '0x456f3e0b',
        extraData: '0xd783010500844765746887676f312e352e31856c696e7578',
        gasLimit: '0x47e7c4',
        gasUsed: '0x493e0',
        hash: '0x6eb2ccd03087179bf53e32ef89db8ae1a7d4c407c691f31c467825e631a53c02',
        logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        miner: '0xdf712c685be75739eb44cb6665f92129e45864e4',
        nonce: '0xd3764129399cdce6',
        number: '0x119633',
        parentHash: '0x9b3dda703bc0de8a2162adb1666880f1dca6f421190616733c7b5a3e127ec7eb',
        receiptRoot: '0x197e4c93706b5c8d685a47909374a99b096948295abba0578aae46708a1e4435',
        sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        size: '0x2b6',
        stateRoot: '0x385a5bdca25f1214fd9e244ac7146cf9dfc21f6a4dfe29819cdd069b2bfc63b8',
        timestamp: '0x57648910',
        totalDifficulty: '0xf19cf28ef992',
        transactionsRoot: '0x7c416eb59638d9a58ec5f526dd1b4326f37e50fa3968700e28d5f65f704e85fc',
        uncles: []
    });
});
describe("parse_contracts_message", function () {
    var test = function (msg) {
        it(JSON.stringify(msg), function (done) {
            augur.filters.parse_contracts_message(msg, function (parsed) {
                if (DEBUG) console.log("parse_contracts_message:", parsed);
                done();
            });
        });
    };
    test([{
        "address": "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
        "blockHash": "0x949556543bbbefc3e440abe08606c8a1903c6d9c100c3e93bdd3f6bc4cdd9974",
        "blockNumber": "0x119406",
        "data": "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000851eb851eb851eb8000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000011f32619b74f9d54f77d94a7f86aef48d67421770774953d023f3c4f0e7bf2a8d",
        "logIndex": "0x0",
        "topics": [
          "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
          "0xebb0d4c04bc87d3b401a5baad3b093a5e7cc3f4e996dc53e36db78c8b374cc9a"
        ],
        "transactionHash": "0xd0f3c5d28308f55f00ad7456e4060ae638acd4927ca79165f620fa970d692201",
        "transactionIndex": "0x0"
    }]);
    test([{
        "address": "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
        "blockHash": "0x0e2f477418a6cc65306a2559a611cafc22d50505b493a1e3674ad9c8076e15e2",
        "blockNumber": "0x11963b",
        "data": "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000df8a189bb07bf96c000000000000000000000000000000000000000000000149000000000000000000000000000000000000000000000000000000000000000000000000000000024eef144a1d15da2a6ad96e36147f3fee70e0ecc3a4f0cbb3932fbd7133809f09",
        "logIndex": "0x2",
        "topics": [
          "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
          "0x3b19a87dc13d7c9165f444bef3044543c132cbd979f062f2459ef3725633a3f4"
        ],
        "transactionHash": "0xe0384041bbc3b637fddc2835841b25d14f893e6cf9866032a13e5fd5068e4ab6",
        "transactionIndex": "0x2"
    }]);
    test([{
        "address": "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
        "blockHash": "0x8c3fa0f2a092adf52702b8ebda332c12311f32a9d7dbeca3fd7ad3237a1b143a",
        "blockNumber": "0x11964c",
        "data": "0x000000000000000000000000ae1ba9370f9c3d64894ed9a101079fd17bf1044800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000001d7dd185ffffff8d00000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000002ccb7a4c7d0c9a0de5c08c459ce78642b23fdbd9df707781a9f4c24f9c1205bfd",
        "logIndex": "0x1",
        "topics": [
          "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
          "0xbbc704ce88ff685a56a6a8e708cec54f981d750d8fe83a53d8c4ffb2d4bf4ddd"
        ],
        "transactionHash": "0xa1796f1e7bd1290ba695908a2633a5164deb83c1431c5106c51fb186e79c257e",
        "transactionIndex": "0x3"
    }]);
});
describe("parse_event_message", function () {
    var test = function (t) {
        it(t.label + ": " + JSON.stringify(t.msg), function (done) {
            augur.filters.parse_event_message(t.label, t.msg, function (parsed) {
                var inputs = api.events[t.label].inputs;
                if (t.label === "log_fill_tx") {
                    assert.property(parsed, "market");
                    assert.property(parsed, "type");
                    assert.property(parsed, "taker");
                    assert.property(parsed, "maker");
                    assert.property(parsed, "price");
                    assert.property(parsed, "tradeid");
                    assert.property(parsed, "outcome");
                    assert.property(parsed, "blockNumber");
                    assert.strictEqual(t.msg[0].topics[1], parsed.market);
                    assert.strictEqual(abi.format_address(t.msg[0].topics[2]), parsed.taker);
                    assert.strictEqual(abi.format_address(t.msg[0].topics[3]), parsed.maker);
                    assert.strictEqual(parseInt(t.msg[0].blockNumber, 16), parsed.blockNumber);
                } else if (t.label === "log_add_tx") {
                    assert.property(parsed, "market");
                    assert.property(parsed, "maker");
                    assert.property(parsed, "type");
                    assert.property(parsed, "price");
                    assert.property(parsed, "amount");
                    assert.property(parsed, "outcome");
                    assert.property(parsed, "blockNumber");
                    assert.strictEqual(t.msg[0].topics[1], parsed.market);
                    assert.strictEqual(abi.format_address(t.msg[0].topics[2]), parsed.maker);
                    assert.strictEqual(parseInt(t.msg[0].blockNumber, 16), parsed.blockNumber);
                } else if (t.label === "tradingFeeUpdated") {
                    assert.property(parsed, "marketID");
                    assert.property(parsed, "tradingFee");
                    assert.deepEqual(parsed.marketID, "0xe7d9beacb528f154ea5bbe325c2497cdb2a208f7fb8460bdf1dbc26e7190775b");
                } else {
                    for (var i = 0; i < inputs.length; ++i) {
                        assert.property(parsed, inputs[i].name);
                        assert.isNotNull(parsed[inputs[i].name]);
                    }
                }
                done();
            });
        });
    };
    test({
        label: "log_add_tx",
        msg: [{
            address: "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
            blockHash: "0xf0bf95c2829ab839253a40cb9c048209f6ce296b92195d6d563dc632d1bc6408",
            blockNumber: "0x11940f",
            data: "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000851eb851eb851eb800000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000001ab0e4dde7838418cb19b273a86530e1a99121fc56311c5e69149f853fb96f11d",
            logIndex: "0x0",
            topics: [
                "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
                "0xebb0d4c04bc87d3b401a5baad3b093a5e7cc3f4e996dc53e36db78c8b374cc9a"
            ],
            transactionHash: "0x66556e5b7c3cb708ca6d807518eaf4ee3f5f0c3512262fae585fbb7d173d6593",
            transactionIndex: "0x0"
        }]
    });
    test({
        label: "log_add_tx",
        msg: [{
            address: "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
            blockHash: "0xf36f8a64964ad218c140d4fe7f35e3ff102a2da044323a58b5eea84a2953a4fb",
            blockNumber: "0x11962d",
            data: "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000f018ac6a199998f600000000000000000000000000000000000000000000009000000000000000000000000000000000000000000000000000000000000000000000000000000002c5a915396f55abfa25862758001012dd5d0d73c0036c21b7244ee58499293dd3",
            logIndex: "0x0",
            topics: [
                "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
                "0x912461a845a572a1fff40a3013bfd639c53493d5b89099e0462ca26cc02be35e"
            ],
            transactionHash: "0xe0932645a38d2bbba352d12ecdfa17abc30131da3f04c53db9ae4030ffc8374c",
            transactionIndex: "0x1"
        }]
    });
    test({
        label: "log_add_tx",
        msg: [{
            address: "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
            blockHash: "0x0e2f477418a6cc65306a2559a611cafc22d50505b493a1e3674ad9c8076e15e2",
            blockNumber: "0x11963b",
            data: "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000a3778633199999bd0000000000000000000000000000000000000000000000d70000000000000000000000000000000000000000000000000000000000000000000000000000000233647cb4e21faa8ce19ca0ddb3d0bdaa59dfe2643707f25656a1a8e67890f506",
            logIndex: "0x0",
            topics: [
                "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
                "0x3b19a87dc13d7c9165f444bef3044543c132cbd979f062f2459ef3725633a3f4"
            ],
            transactionHash: "0x409156212bd92eec4273032b5b9c2d6ae8d73eb9169df2b181b78d8a463465a4",
            transactionIndex: "0x0"
        }]
    });
    test({
        label: "log_add_tx",
        msg: [{
            address: "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
            blockHash: "0x0e2f477418a6cc65306a2559a611cafc22d50505b493a1e3674ad9c8076e15e2",
            blockNumber: "0x11963b",
            data: "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000c180cf67650ac995000000000000000000000000000000000000000000000149000000000000000000000000000000000000000000000000000000000000000000000000000000027b95951c2366ae4d1155214a01a9000cb018c9b69cf23343d4c292feb9126514",
            logIndex: "0x1",
            topics: [
                "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
                "0x3b19a87dc13d7c9165f444bef3044543c132cbd979f062f2459ef3725633a3f4"
            ],
            transactionHash: "0x77033aaa1f445b556265d1f9c13265e433121d76adbd5860143f3f0db3e258f6",
            transactionIndex: "0x1"
        }]
    });
    test({
        label: "log_add_tx",
        msg: [{
            address: "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
            blockHash: "0x0e2f477418a6cc65306a2559a611cafc22d50505b493a1e3674ad9c8076e15e2",
            blockNumber: "0x11963b",
            data: "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000df8a189bb07bf96c000000000000000000000000000000000000000000000149000000000000000000000000000000000000000000000000000000000000000000000000000000024eef144a1d15da2a6ad96e36147f3fee70e0ecc3a4f0cbb3932fbd7133809f09",
            logIndex: "0x2",
            topics: [
                "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
                "0x3b19a87dc13d7c9165f444bef3044543c132cbd979f062f2459ef3725633a3f4"
            ],
            transactionHash: "0xe0384041bbc3b637fddc2835841b25d14f893e6cf9866032a13e5fd5068e4ab6",
            transactionIndex: "0x2"
        }]
    });
    test({
        label: "log_add_tx",
        msg: [{
            address: "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
            blockHash: "0x8c3fa0f2a092adf52702b8ebda332c12311f32a9d7dbeca3fd7ad3237a1b143a",
            blockNumber: "0x11964c",
            data: "0x000000000000000000000000ae1ba9370f9c3d64894ed9a101079fd17bf1044800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000001d7dd185ffffff8d00000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000002ccb7a4c7d0c9a0de5c08c459ce78642b23fdbd9df707781a9f4c24f9c1205bfd",
            logIndex: "0x1",
            topics: [
                "0x8dbed7bffe37a9907a92186110f23d8104f5967a71fb059f3b907ca9001fd160",
                "0xbbc704ce88ff685a56a6a8e708cec54f981d750d8fe83a53d8c4ffb2d4bf4ddd"
            ],
            transactionHash: "0xa1796f1e7bd1290ba695908a2633a5164deb83c1431c5106c51fb186e79c257e",
            transactionIndex: "0x3"
        }]
    });
    test({
        label: "log_cancel",
        msg: [{
            address: "0x8d28df956673fa4a8bc30cd0b3cb657445bc820e",
            blockHash: "0x171e8b766a39d5922cdeb45f9f4b3ebfba60d98a4a0b5c1e2dd14fb223fcd595",
            blockNumber: "0x11966f",
            data: "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c00000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000010000000000000000c84e2b59c1a8cb678624e582d22e3ac0b4bbed6490900065143bf29b0563e1ee00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002",
            logIndex: "0x0",
            topics: [
                "0x9ecf4903f3efaf1549dc51545bd945f94d51923f37ce198a3b838125a2f397d5",
                "0x467982cbbb0fbb3fc4499f4376aa15795f44a999f32369476f355196f52eeb68"
            ],
            transactionHash: "0xf5a45ffe66c9182545dd6c876d2727dded27ea41369ebee7d1b3c7469e70a99c",
            transactionIndex: "0x2"
        }]
    });
    test({
        label: "marketCreated", 
        msg: [{
            address: "0x660cdfdf3d0e7443e7935343a1131b961575ccc7",
            blockHash: "0xcf5d85980bfaf9734abac4420ff6917e39e840e9cb6251a9b640b5450f33405f",
            blockNumber: "0x119635",
            data: "0x3b19a87dc13d7c9165f444bef3044543c132cbd979f062f2459ef3725633a3f4",
            logIndex: "0x0",
            topics: ["0x63f140d7adcc464732c9379020aa9e5ce1b1e350796814d780ea3ca41d62a36b"],
            transactionHash: "0xb3a253b63bc7ea4e69699fbfa5d637c3a08acc9747eabd394caa4c9ebd5d254e",
            transactionIndex: "0x0"
        }]
    });
    test({
        label: "tradingFeeUpdated",
        msg: [{
            address: "0x181ab5cfb79c3a4edd7b4556412b40453edeec32",
            blockHash: "0x5f725f19f6e8d250ebaffdc3e9ce898dfd1c1aca2f33d760015148110df16e25",
            blockNumber: "0x15074b",
            data: "0xe7d9beacb528f154ea5bbe325c2497cdb2a208f7fb8460bdf1dbc26e7190775b000000000000000000000000000000000000000000000000009c51c4521e0000",
            logIndex: "0x0",
            topics: ["0xb8c735cc6495f8dac2581d532413dea78d7e03e0ff0880c32b4648c2145fba41"],
            transactionHash: "0xdd394f14b92162c5b29011512513fff0188c5cff9b4d0d453b40175db6f9e868",
            transactionIndex: "0x0"
        }]
    });
    test({
        label: "log_fill_tx",
        msg: [{
            address: "0x13cef2d86d4024f102e480627239359b5cb7bf52",
            blockHash: "0x8171815b23ee1e0cf62e331f283c6d977689a93e3574b2ca35f75c19804914ef",
            blockNumber: "0x11941e",
            data: "0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000000de0b6b3a7640000640ce61af3b560a54f2f41dcba10ef6337df02e650c30f651789a090b02c312f0000000000000000000000000000000000000000000000000000000000000001",
            logIndex: "0x0",
            topics: [
                "0x715b9a9cb6dfb4fa9cb1ebc2eba40d2a7bd66aa8cef75f87a77d1ff05d29a3b6",
                "0xebb0d4c04bc87d3b401a5baad3b093a5e7cc3f4e996dc53e36db78c8b374cc9a",
                "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c",
                "0x00000000000000000000000015f6400a88fb320822b689607d425272bea2175f"
            ],
            transactionHash: "0xf9d3dd428f4d27c6ee14c6a08d877f777bc0365d29fad06ddc0f9dce11dbb9ce",
            transactionIndex: "0x0"
        }]
    });
    test({
        label: "log_fill_tx",
        msg: [{
            address: "0x13cef2d86d4024f102e480627239359b5cb7bf52",
            blockHash: "0x0a383bf904a7156d840dbf7ebd0b30ff79dce4950dfa4b5b80bdb619070085d1",
            blockNumber: "0x11964b",
            data: "0x00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000001d7dd185ffffff8d0000000000000000000000000000000000000000000000001d7dd185ffffff8d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002",
            logIndex: "0x1",
            topics: [
                "0x715b9a9cb6dfb4fa9cb1ebc2eba40d2a7bd66aa8cef75f87a77d1ff05d29a3b6",
                "0xbbc704ce88ff685a56a6a8e708cec54f981d750d8fe83a53d8c4ffb2d4bf4ddd",
                "0x000000000000000000000000ae1ba9370f9c3d64894ed9a101079fd17bf10448",
                "0x000000000000000000000000dfb3458ad28f9ce1a6405e8c85daa8c8bdefb24b"
            ],
            transactionHash: "0x6becec25bcb68824ad1904ed3424bdd056055413b96a4195b803c7a1b32b6c1e",
            transactionIndex: "0x2"
        }]
    });
});

// describe("parse_log_fill_tx_message", function () {
//     var test = function (msg) {
//         it(JSON.stringify(msg), function (done) {
//             augur.filters.parse_log_fill_tx_message(msg, function (parsed) {
//                 assert.property(parsed, "market");
//                 assert.property(parsed, "type");
//                 assert.property(parsed, "taker");
//                 assert.property(parsed, "maker");
//                 assert.property(parsed, "price");
//                 assert.property(parsed, "tradeid");
//                 assert.property(parsed, "outcome");
//                 assert.property(parsed, "blockNumber");
//                 assert.strictEqual(msg[0].topics[1], parsed.market);
//                 assert.strictEqual(abi.format_address(msg[0].topics[2]), parsed.taker);
//                 assert.strictEqual(abi.format_address(msg[0].topics[3]), parsed.maker);
//                 assert.strictEqual(parseInt(msg[0].blockNumber, 16), parsed.blockNumber);
//                 done();
//             });
//         });
//     };
//     test([{
//         address: "0x13cef2d86d4024f102e480627239359b5cb7bf52",
//         blockHash: "0x8171815b23ee1e0cf62e331f283c6d977689a93e3574b2ca35f75c19804914ef",
//         blockNumber: "0x11941e",
//         data: "0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000000de0b6b3a7640000640ce61af3b560a54f2f41dcba10ef6337df02e650c30f651789a090b02c312f0000000000000000000000000000000000000000000000000000000000000001",
//         logIndex: "0x0",
//         topics: [
//             "0x715b9a9cb6dfb4fa9cb1ebc2eba40d2a7bd66aa8cef75f87a77d1ff05d29a3b6",
//             "0xebb0d4c04bc87d3b401a5baad3b093a5e7cc3f4e996dc53e36db78c8b374cc9a",
//             "0x0000000000000000000000007c0d52faab596c08f484e3478aebc6205f3f5d8c",
//             "0x00000000000000000000000015f6400a88fb320822b689607d425272bea2175f"
//         ],
//         transactionHash: "0xf9d3dd428f4d27c6ee14c6a08d877f777bc0365d29fad06ddc0f9dce11dbb9ce",
//         transactionIndex: "0x0"
//     }]);
//     test([{
//         address: "0x13cef2d86d4024f102e480627239359b5cb7bf52",
//         blockHash: "0x0a383bf904a7156d840dbf7ebd0b30ff79dce4950dfa4b5b80bdb619070085d1",
//         blockNumber: "0x11964b",
//         data: "0x00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000001d7dd185ffffff8d0000000000000000000000000000000000000000000000001d7dd185ffffff8d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002",
//         logIndex: "0x1",
//         topics: 
//          [ "0x715b9a9cb6dfb4fa9cb1ebc2eba40d2a7bd66aa8cef75f87a77d1ff05d29a3b6",
//            "0xbbc704ce88ff685a56a6a8e708cec54f981d750d8fe83a53d8c4ffb2d4bf4ddd",
//            "0x000000000000000000000000ae1ba9370f9c3d64894ed9a101079fd17bf10448",
//            "0x000000000000000000000000dfb3458ad28f9ce1a6405e8c85daa8c8bdefb24b" ],
//         transactionHash: "0x6becec25bcb68824ad1904ed3424bdd056055413b96a4195b803c7a1b32b6c1e",
//         transactionIndex: "0x2"
//     }]);
// });

// describe("parse_tradingFeeUpdated_message", function () {
//     var test = function (msg) {
//         it(JSON.stringify(msg), function (done) {
//             augur.filters.parse_tradingFeeUpdated_message(msg, function (parsed) {
//                 assert.property(parsed, "marketID");
//                 assert.property(parsed, "tradingFee");
//                 assert.deepEqual(parsed.marketID, "0xe7d9beacb528f154ea5bbe325c2497cdb2a208f7fb8460bdf1dbc26e7190775b");
//                 if (DEBUG) console.log("parse_tradingFeeUpdated_message:", parsed);
//                 done();
//             });
//         });
//     };
//     test([{
//         address: "0x181ab5cfb79c3a4edd7b4556412b40453edeec32",
//         blockHash: "0x5f725f19f6e8d250ebaffdc3e9ce898dfd1c1aca2f33d760015148110df16e25",
//         blockNumber: "0x15074b",
//         data: "0xe7d9beacb528f154ea5bbe325c2497cdb2a208f7fb8460bdf1dbc26e7190775b000000000000000000000000000000000000000000000000009c51c4521e0000",
//         logIndex: "0x0",
//         topics: [ "0xb8c735cc6495f8dac2581d532413dea78d7e03e0ff0880c32b4648c2145fba41" ],
//         transactionHash: "0xdd394f14b92162c5b29011512513fff0188c5cff9b4d0d453b40175db6f9e868",
//         transactionIndex: "0x0"
//     }]);
// });

describe("listen", function () {
    it("ignores invalid label", function (done) {
        this.timeout(tools.TIMEOUT);
        augur.filters.listen({
            invalidFilterLabel: function (msg) {}
        }, function (filters) {
            done();
        });
    });
    it("doesn't hang on same label", function (done) {
        this.timeout(tools.TIMEOUT);
        augur.filters.listen({
            marketCreated: {}
        }, function (filters) {
            var id = filters.marketCreated.id;
            augur.filters.listen({
                marketCreated: {}
            }, function (filters) {
                assert.notStrictEqual(id, filters.marketCreated.id);
                done();
            });
        });
    });
});
