import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
    name: "$writeHeader",
    description: "Set an HTTP header for the response",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "key",
            description: "Header key",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "value",
            description: "Header value",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx: Context, [key, value]: [string, string]) {
        const extras = ctx.runtime.extras as any;
        extras.response.writeHeader(key, value);
        return this.success();
    }
});
