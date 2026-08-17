import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";
import { throttleStats } from "../../throttle";

export default new NativeFunction({
    name: "$throttleStats",
    description: "Returns current throttle statistics",
    version: "1.5.0",
    output: ArgType.Json,
    unwrap: false,
    execute(ctx: Context) {
        return this.successJSON(throttleStats());
    }
});
