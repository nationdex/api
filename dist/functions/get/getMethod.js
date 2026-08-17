"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$getMethod",
    description: "Get the HTTP method of the request",
    version: "1.5.0",
    output: forgescript_1.ArgType.Unknown,
    unwrap: false,
    execute(ctx) {
        const extras = ctx.runtime.extras;
        return this.success(extras.request.getMethod());
    }
});
