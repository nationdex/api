"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$getHeaders",
    description: "Returns all request headers",
    version: "1.5.0",
    output: forgescript_1.ArgType.Json,
    unwrap: false,
    execute(ctx) {
        const headers = {};
        const extras = ctx.runtime.extras;
        extras.request.forEach((key, value) => {
            headers[key] = value;
        });
        return this.successJSON(headers);
    }
});
//# sourceMappingURL=getHeaders.js.map