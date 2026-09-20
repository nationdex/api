"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$sendJson",
    description: "Send JSON response",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "json",
            description: "JSON data to send",
            type: forgescript_1.ArgType.Json,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [json]) {
        const extras = ctx.runtime.extras;
        extras.response.writeHeader("Content-Type", "application/json").end(JSON.stringify(json));
        return this.success();
    }
});
//# sourceMappingURL=sendJson.js.map