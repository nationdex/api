import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
    name: "$deleteCookie",
    description: "Delete a cookie by setting it to expire",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "Cookie name to delete",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "path",
            description: "Cookie path (should match original)",
            type: ArgType.String,
            rest: false
        },
        {
            name: "domain",
            description: "Cookie domain (should match original)",
            type: ArgType.String,
            rest: false
        }
    ],
    execute(ctx: Context, [name, path, domain]: [string, string | null, string | null]) {
        const extras = ctx.runtime.extras as any;
        let cookie = name + "=; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
        if (path) cookie += "; Path=" + path;
        if (domain) cookie += "; Domain=" + domain;
        extras.response.writeHeader("Set-Cookie", cookie);
        return this.success();
    }
});
