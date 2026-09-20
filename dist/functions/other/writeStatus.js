"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$writeStatus",
    description: "Set the HTTP status code for the response",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "status",
            description: "Status code (e.g., 200, 404)",
            type: forgescript_1.ArgType.Number,
            required: true,
            rest: false
        },
        {
            name: "message",
            description: "Status message",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [status, message]) {
        const extras = ctx.runtime.extras;
        extras.response.writeStatus(message ? status + " " + message : status.toString());
        return this.success();
    }
});
//# sourceMappingURL=writeStatus.js.map