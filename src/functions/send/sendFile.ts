import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";
import { mime } from "../../mime";
import { streamFile } from "../../file";
import { extname } from "path";

export default new NativeFunction({
  name: "$sendFile",
  description: "Send a file for viewing in the browser",
  version: "1.5.0",
  brackets: true,
  unwrap: true,
  args: [
    {
      name: "path",
      description: "Path to the file",
      type: ArgType.String,
      required: true,
      rest: false,
    },
  ],
  async execute(ctx: Context, [path]: [string]) {
    const extras = ctx.runtime.extras as any;
    await streamFile(extras.response, path, {
      "Content-Type":
        mime.get(extname(path).toLowerCase()) || "application/octet-stream",
    });
    return this.success();
  },
});
