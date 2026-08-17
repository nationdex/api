import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
    name: "$redirect",
    description: "Redirect to a specified URL",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "url",
            description: "URL to redirect to",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx: Context, [url]: [string]) {
        const extras = ctx.runtime.extras as any;
        extras.response.writeStatus("302").writeHeader("Location", url).end();
        return this.success();
    }
});
