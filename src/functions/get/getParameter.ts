import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
  name: "$getParameter",
  description: "Get a URL parameter value",
  version: "1.5.0",
  output: ArgType.Unknown,
  brackets: true,
  unwrap: true,
  args: [
    {
      name: "param",
      description: "Parameter index (number) or name (string)",
      type: ArgType.String,
      required: true,
      rest: false,
    },
  ],
  execute(ctx: Context, [param]: [string]) {
    const extras = ctx.runtime.extras as any;
    return this.success(
      extras.request.getParameter(isNaN(+param) ? param : +param),
    );
  },
});
