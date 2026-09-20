"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const throttle_1 = require("../../throttle");
exports.default = new forgescript_1.NativeFunction({
    name: "$throttleStats",
    description: "Returns current throttle statistics",
    version: "1.5.0",
    output: forgescript_1.ArgType.Json,
    unwrap: false,
    execute(ctx) {
        return this.successJSON((0, throttle_1.throttleStats)());
    }
});
//# sourceMappingURL=throttleStats.js.map