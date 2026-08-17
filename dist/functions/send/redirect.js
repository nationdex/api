"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$redirect",
    description: "Redirect to a specified URL",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "url",
            description: "URL to redirect to",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [url]) {
        const extras = ctx.runtime.extras;
        extras.response.writeStatus("302").writeHeader("Location", url).end();
        return this.success();
    }
});
