import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
  name: "$getHeader",
  description: "Get a header value from the request",
  version: "1.5.0",
  output: ArgType.Unknown,
  brackets: true,
  unwrap: true,
  args: [
    {
      name: "key",
      description: "Header key",
      type: ArgType.String,
      required: true,
      rest: false,
    },
  ],
  execute(ctx: Context, [key]: [string]) {
    const extras = ctx.runtime.extras as any;
    return this.success(extras.request.getHeader(key.toLowerCase()));
  },
});
