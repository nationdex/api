import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";
import { streamFile } from "../../file";
import { basename } from "path";

export default new NativeFunction({
    name: "$sendAttachment",
    description: "Send a file as a downloadable attachment",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "path",
            description: "Path to the file",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "name",
            description: "Custom filename",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    async execute(ctx: Context, [path, name]: [string, string]) {
        const extras = ctx.runtime.extras as any;
        await streamFile(extras.response, path, {
            "Content-Disposition": `attachment; filename="${name || basename(path)}"`,
            "Content-Type": "application/octet-stream"
        });
        return this.success();
    }
});
