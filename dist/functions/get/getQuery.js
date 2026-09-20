"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$getQuery",
    description: "Get a query parameter value from the URL",
    version: "1.5.0",
    output: forgescript_1.ArgType.Unknown,
    brackets: false,
    unwrap: true,
    args: [
        {
            name: "key",
            description: "Query parameter key",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [key]) {
        const extras = ctx.runtime.extras;
        return this.success(extras.request.getQuery(key));
    }
});
//# sourceMappingURL=getQuery.js.map