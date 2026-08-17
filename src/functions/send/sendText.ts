import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
    name: "$sendText",
    description: "Send a text response",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "text",
            description: "Text data to send",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx: Context, [text]: [string]) {
        const extras = ctx.runtime.extras as any;
        extras.response.writeHeader("Content-Type", "text/plain").end(text);
        return this.success();
    }
});
