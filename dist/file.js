"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamFile = streamFile;
const promises_1 = require("fs/promises");
async function streamFile(response, path, headers) {
    let file;
    let aborted = false;
    response.onAborted(() => (aborted = true));
    try {
        file = await (0, promises_1.open)(path, "r");
        const { size } = await file.stat();
        response.cork(() => {
            const keys = Object.keys(headers);
            for (let i = 0; i < keys.length; i++)
                response.writeHeader(keys[i], headers[keys[i]]);
            response.writeHeader("Content-Length", size.toString());
        });
        const buffer = Buffer.allocUnsafe(16384);
        let offset = 0;
        while (offset < size && !aborted) {
            const { bytesRead } = await file.read(buffer, 0, Math.min(16384, size - offset), offset);
            if (!bytesRead || aborted)
                break;
            const chunk = buffer.subarray(0, bytesRead);
            const write = response.getWriteOffset();
            await new Promise((resolve) => {
                response.cork(() => {
                    const hcv = response.tryEnd(chunk, size);
                    if (hcv[1] || hcv[0])
                        return resolve((offset += bytesRead));
                    response.onWritable((off) => {
                        let done = false;
                        response.cork(() => {
                            const mnh = response.tryEnd(chunk.subarray(off - write), size);
                            done = mnh[1];
                            if (done || mnh[0])
                                resolve((offset += bytesRead));
                        });
                        return !done && !aborted;
                    });
                });
            });
        }
    }
    catch {
        if (!aborted)
            response.cork(() => response.end("File not found"));
    }
    finally {
        await file?.close();
    }
}
//# sourceMappingURL=file.js.map