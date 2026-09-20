"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$deleteCookie",
    description: "Delete a cookie by setting it to expire",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "Cookie name to delete",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "path",
            description: "Cookie path (should match original)",
            type: forgescript_1.ArgType.String,
            rest: false
        },
        {
            name: "domain",
            description: "Cookie domain (should match original)",
            type: forgescript_1.ArgType.String,
            rest: false
        }
    ],
    execute(ctx, [name, path, domain]) {
        const extras = ctx.runtime.extras;
        let cookie = name + "=; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
        if (path)
            cookie += "; Path=" + path;
        if (domain)
            cookie += "; Domain=" + domain;
        extras.response.writeHeader("Set-Cookie", cookie);
        return this.success();
    }
});
//# sourceMappingURL=deleteCookie.js.map