import { NativeFunction, Context } from "@tryforge/forgescript";
import { updateRoutes } from "../../api";

export default new NativeFunction({
    name: "$updateRoutes",
    description: "Reload all routes from the previously set directory",
    version: "1.3.0",
    unwrap: false,
    async execute(ctx: Context) {
        await updateRoutes();
        return this.success();
    }
});
