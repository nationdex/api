import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
    name: "$sendHtml",
    description: "Send HTML response",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "html",
            description: "HTML content to send",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx: Context, [html]: [string]) {
        const extras = ctx.runtime.extras as any;
        extras.response.writeHeader("Content-Type", "text/html").end(html);
        return this.success();
    }
});
