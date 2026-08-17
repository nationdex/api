import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
    name: "$getHeaders",
    description: "Returns all request headers",
    version: "1.5.0",
    output: ArgType.Json,
    unwrap: false,
    execute(ctx: Context) {
        const headers: Record<string, string> = {};
        const extras = ctx.runtime.extras as any;
        extras.request.forEach((key: string, value: string) => {
            headers[key] = value;
        });
        return this.successJSON(headers);
    }
});
