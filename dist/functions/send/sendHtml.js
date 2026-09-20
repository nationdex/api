"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$sendHtml",
    description: "Send HTML response",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "html",
            description: "HTML content to send",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [html]) {
        const extras = ctx.runtime.extras;
        extras.response.writeHeader("Content-Type", "text/html").end(html);
        return this.success();
    }
});
//# sourceMappingURL=sendHtml.js.map