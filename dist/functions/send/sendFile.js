"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const mime_1 = require("../../mime");
const file_1 = require("../../file");
const path_1 = require("path");
exports.default = new forgescript_1.NativeFunction({
    name: "$sendFile",
    description: "Send a file for viewing in the browser",
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
        }
    ],
    async execute(ctx, [path]) {
        const extras = ctx.runtime.extras;
        await (0, file_1.streamFile)(extras.response, path, {
            "Content-Type": mime_1.mime.get((0, path_1.extname)(path).toLowerCase()) || "application/octet-stream"
        });
        return this.success();
    }
});
//# sourceMappingURL=sendFile.js.map