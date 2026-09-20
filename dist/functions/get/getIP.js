"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const convert_1 = require("../../convert");
exports.default = new forgescript_1.NativeFunction({
    name: "$getIP",
    description: "Gets the client's IP address",
    version: "1.5.0",
    output: forgescript_1.ArgType.String,
    unwrap: false,
    execute(ctx) {
        const extras = ctx.runtime.extras;
        return this.success((0, convert_1.convertIP)(extras.response.getRemoteAddress()));
    }
});
//# sourceMappingURL=getIP.js.map