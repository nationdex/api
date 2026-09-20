"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$getCookie",
    description: "Get a cookie value from the request",
    version: "1.5.0",
    output: forgescript_1.ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "Cookie name",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [name]) {
        const extras = ctx.runtime.extras;
        const header = extras.request.getHeader("cookie");
        if (!header)
            return this.success();
        const parts = header.split(";");
        for (let i = 0; i < parts.length; i++) {
            const cookie = parts[i].trim();
            const index = cookie.indexOf("=");
            if (index === -1)
                continue;
            const key = cookie.substring(0, index);
            if (key === name) {
                const value = cookie.substring(index + 1);
                return this.success(decodeURIComponent(value));
            }
        }
        return this.success();
    }
});
//# sourceMappingURL=getCookie.js.map