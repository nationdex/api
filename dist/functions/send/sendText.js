"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$sendText",
    description: "Send a text response",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "text",
            description: "Text data to send",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [text]) {
        const extras = ctx.runtime.extras;
        extras.response.writeHeader("Content-Type", "text/plain").end(text);
        return this.success();
    }
});
