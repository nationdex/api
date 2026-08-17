import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
    name: "$getCookies",
    description: "Get all cookies from the request",
    version: "1.5.0",
    output: ArgType.Json,
    unwrap: false,
    execute(ctx: Context) {
        const extras = ctx.runtime.extras as any;
        const header = extras.request.getHeader("cookie");
        if (!header) return this.successJSON({});
        const cookies: Record<string, string> = {};
        const parts = header.split(";");
        for (let i = 0; i < parts.length; i++) {
            const cookie = parts[i].trim();
            const index = cookie.indexOf("=");
            if (index === -1) continue;
            const key = cookie.substring(0, index);
            if (key) {
                const value = cookie.substring(index + 1);
                cookies[key] = decodeURIComponent(value);
            }
        }
        return this.successJSON(cookies);
    }
});
