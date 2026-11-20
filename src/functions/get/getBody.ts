import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
  name: "$getBody",
  description: "Gets the request body from POST, PUT, PATCH requests",
  version: "1.5.0",
  output: ArgType.Unknown,
  unwrap: false,
  async execute(ctx: Context) {
    const extras = ctx.runtime.extras as any;
    return this.success(await extras.request.text());
  },
});
