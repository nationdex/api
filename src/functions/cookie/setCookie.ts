import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
    name: "$setCookie",
    description: "Set a cookie in the response",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "Cookie name",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "value",
            description: "Cookie value",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "options",
            description: "Cookie options (JSON: {maxAge, path, domain, secure, httpOnly, sameSite, expires})",
            type: ArgType.Json,
            rest: false
        }
    ],
    execute(ctx: Context, [name, value, options]: [string, string, Record<string, any> | null]) {
        const extras = ctx.runtime.extras as any;
        const opts = options || {};
        let cookie = name + "=" + encodeURIComponent(value);
        if (opts.maxAge) cookie += "; Max-Age=" + opts.maxAge;
        if (opts.path) cookie += "; Path=" + opts.path;
        if (opts.domain) cookie += "; Domain=" + opts.domain;
        if (opts.secure) cookie += "; Secure";
        if (opts.httpOnly) cookie += "; HttpOnly";
        if (opts.sameSite) cookie += "; SameSite=" + opts.sameSite;
        if (opts.expires) cookie += "; Expires=" + new Date(opts.expires).toUTCString();
        extras.response.writeHeader("Set-Cookie", cookie);
        return this.success();
    }
});
