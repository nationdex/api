"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
exports.default = new forgescript_1.NativeFunction({
    name: "$getBody",
    description: "Gets the request body from POST, PUT, PATCH requests",
    version: "1.5.0",
    output: forgescript_1.ArgType.Unknown,
    unwrap: false,
    async execute(ctx) {
        const extras = ctx.runtime.extras;
        return this.success(await new Promise(resolve => {
            const chunks = [];
            extras.response.onData((chunk, isLast) => {
                chunks.push(new Uint8Array(chunk).slice());
                if (isLast) {
                    const length = chunks.reduce((sum, item) => sum + item.length, 0);
                    const combined = new Uint8Array(length);
                    let offset = 0;
                    for (const item of chunks) {
                        combined.set(item, offset);
                        offset += item.length;
                    }
                    const result = new TextDecoder("utf-8").decode(combined);
                    resolve(result);
                }
            });
        }));
    }
});
//# sourceMappingURL=getBody.js.map