import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";
import { convertIP } from "../../convert";

export default new NativeFunction({
    name: "$getProxiedIP",
    description: "Gets the client's proxied IP address",
    version: "1.5.0",
    output: ArgType.String,
    unwrap: false,
    execute(ctx: Context) {
        const extras = ctx.runtime.extras as any;
        return this.success(convertIP(extras.response.getProxiedRemoteAddress()));
    }
});
