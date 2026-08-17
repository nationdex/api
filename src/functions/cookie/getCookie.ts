import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
    name: "$getCookie",
    description: "Get a cookie value from the request",
    version: "1.5.0",
    output: ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "Cookie name",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx: Context, [name]: [string]) {
        const extras = ctx.runtime.extras as any;
        const header = extras.request.getHeader("cookie");
        if (!header) return this.success();
        const parts = header.split(";");
        for (let i = 0; i < parts.length; i++) {
            const cookie = parts[i].trim();
            const index = cookie.indexOf("=");
            if (index === -1) continue;
            const key = cookie.substring(0, index);
            if (key === name) {
                const value = cookie.substring(index + 1);
                return this.success(decodeURIComponent(value));
            }
        }
        return this.success();
    }
});
