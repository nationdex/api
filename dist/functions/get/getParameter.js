"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$getParameter",
    description: "Get a URL parameter value",
    version: "1.5.0",
    output: forgescript_1.ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "param",
            description: "Parameter index (number) or name (string)",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [param]) {
        const extras = ctx.runtime.extras;
        return this.success(extras.request.getParameter(isNaN(+param) ? param : +param));
    }
});
//# sourceMappingURL=getParameter.js.map