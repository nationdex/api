import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
    name: "$getMethod",
    description: "Get the HTTP method of the request",
    version: "1.5.0",
    output: ArgType.Unknown,
    unwrap: false,
    execute(ctx: Context) {
        const extras = ctx.runtime.extras as any;
        return this.success(extras.request.getMethod());
    }
});
