"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$setCookie",
    description: "Set a cookie in the response",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "Cookie name",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "value",
            description: "Cookie value",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "options",
            description: "Cookie options (JSON: {maxAge, path, domain, secure, httpOnly, sameSite, expires})",
            type: forgescript_1.ArgType.Json,
            rest: false
        }
    ],
    execute(ctx, [name, value, options]) {
        const extras = ctx.runtime.extras;
        const opts = options || {};
        let cookie = name + "=" + encodeURIComponent(value);
        if (opts.maxAge)
            cookie += "; Max-Age=" + opts.maxAge;
        if (opts.path)
            cookie += "; Path=" + opts.path;
        if (opts.domain)
            cookie += "; Domain=" + opts.domain;
        if (opts.secure)
            cookie += "; Secure";
        if (opts.httpOnly)
            cookie += "; HttpOnly";
        if (opts.sameSite)
            cookie += "; SameSite=" + opts.sameSite;
        if (opts.expires)
            cookie += "; Expires=" + new Date(opts.expires).toUTCString();
        extras.response.writeHeader("Set-Cookie", cookie);
        return this.success();
    }
});
