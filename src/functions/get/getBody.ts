import { NativeFunction, ArgType, Context } from "@tryforge/forgescript";

export default new NativeFunction({
    name: "$getBody",
    description: "Gets the request body from POST, PUT, PATCH requests",
    version: "1.5.0",
    output: ArgType.Unknown,
    unwrap: false,
    async execute(ctx: Context) {
        const extras = ctx.runtime.extras as any;
        return this.success(await new Promise<string>(resolve => {
            const chunks: Uint8Array[] = [];
            extras.response.onData((chunk: ArrayBuffer, isLast: boolean) => {
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
