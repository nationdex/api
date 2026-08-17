import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
    name: "$setYield",
    description: "Indicates that the current route handler did not handle the request, allowing the router to continue searching for other matching handlers",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "yield",
            description: "Skip processing",
            type: ArgType.Boolean,
            required: true,
            rest: false
        }
    ],
    async execute(ctx: Context, [shouldYield]: [boolean]) {
        const extras = ctx.runtime.extras as any;
        extras.request.setYield(shouldYield);
        return this.success();
    }
});
