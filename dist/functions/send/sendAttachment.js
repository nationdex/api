"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const file_1 = require("../../file");
const path_1 = require("path");
exports.default = new forgescript_1.NativeFunction({
    name: "$sendAttachment",
    description: "Send a file as a downloadable attachment",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "path",
            description: "Path to the file",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "name",
            description: "Custom filename",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [path, name]) {
        const extras = ctx.runtime.extras;
        await (0, file_1.streamFile)(extras.response, path, {
            "Content-Disposition": `attachment; filename="${name || (0, path_1.basename)(path)}"`,
            "Content-Type": "application/octet-stream"
        });
        return this.success();
    }
});
