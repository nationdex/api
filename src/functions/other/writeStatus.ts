import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
    name: "$writeStatus",
    description: "Set the HTTP status code for the response",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "status",
            description: "Status code (e.g., 200, 404)",
            type: ArgType.Number,
            required: true,
            rest: false
        },
        {
            name: "message",
            description: "Status message",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx: Context, [status, message]: [number, string]) {
        const extras = ctx.runtime.extras as any;
        extras.response.writeStatus(message ? status + " " + message : status.toString());
        return this.success();
    }
});
