"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$getHeader",
    description: "Get a header value from the request",
    version: "1.5.0",
    output: forgescript_1.ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "key",
            description: "Header key",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [key]) {
        const extras = ctx.runtime.extras;
        return this.success(extras.request.getHeader(key.toLowerCase()));
    }
});
//# sourceMappingURL=getHeader.js.map