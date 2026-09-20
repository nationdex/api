"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$setYield",
    description: "Indicates that the current route handler did not handle the request, allowing the router to continue searching for other matching handlers",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "yield",
            description: "Skip processing",
            type: forgescript_1.ArgType.Boolean,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [shouldYield]) {
        const extras = ctx.runtime.extras;
        extras.request.setYield(shouldYield);
        return this.success();
    }
});
//# sourceMappingURL=setYield.js.map