import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
  name: "$sendJson",
  description: "Send JSON response",
  version: "1.5.0",
  brackets: true,
  unwrap: true,
  args: [
    {
      name: "json",
      description: "JSON data to send",
      type: ArgType.Json,
      required: true,
      rest: false,
    },
  ],
  execute(ctx: Context, [json]: [Record<string, any>]) {
    const extras = ctx.runtime.extras as any;
    extras.response
      .writeHeader("Content-Type", "application/json")
      .end(JSON.stringify(json));
    return this.success();
  },
});
