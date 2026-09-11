/// <reference types="bun-types" />
import { open, FileHandle } from "fs/promises";
import type { HttpResponse } from "uWebSockets.js";
import { BunHttpResponse } from "./server/bun";

export async function streamFile(response: HttpResponse | BunHttpResponse, path: string, headers: Record<string, string>): Promise<void> {
    if (response instanceof BunHttpResponse) return streamFileBun(response, path, headers);
    return streamFileUws(response as HttpResponse, path, headers);
}

async function streamFileBun(response: BunHttpResponse, path: string, headers: Record<string, string>): Promise<void> {
    const file = Bun.file(path);
    if (!(await file.exists())) {
        response.end("File not found");
        return;
    }
    const keys = Object.keys(headers);
    for (let i = 0; i < keys.length; i++) response.writeHeader(keys[i], headers[keys[i]]);
    response.writeHeader("Content-Length", file.size.toString());
    response.endWithBody(file);
}

async function streamFileUws(response: HttpResponse, path: string, headers: Record<string, string>): Promise<void> {
    let file: FileHandle | undefined;
    let aborted = false;
    response.onAborted(() => (aborted = true));
    try {
        file = await open(path, "r");
        const { size } = await file.stat();
        response.cork(() => {
            const keys = Object.keys(headers);
            for (let i = 0; i < keys.length; i++) response.writeHeader(keys[i], headers[keys[i]]);
            response.writeHeader("Content-Length", size.toString());
        });
        const buffer = Buffer.allocUnsafe(16384);
        let offset = 0;
        while (offset < size && !aborted) {
            const { bytesRead } = await file.read(buffer, 0, Math.min(16384, size - offset), offset);
            if (!bytesRead || aborted) break;
            const chunk = buffer.subarray(0, bytesRead);
            const write = response.getWriteOffset();
            await new Promise<number>((resolve) => {
                response.cork(() => {
                    const hcv = response.tryEnd(chunk, size);
                    if (hcv[1] || hcv[0]) return resolve((offset += bytesRead));
                    response.onWritable((off) => {
                        let done = false;
                        response.cork(() => {
                            const mnh = response.tryEnd(chunk.subarray(off - write), size);
                            done = mnh[1];
                            if (done || mnh[0]) resolve((offset += bytesRead));
                        });
                        return !done && !aborted;
                    });
                });
            });
        }
    } catch {
        if (!aborted) response.cork(() => response.end("File not found"));
    } finally {
        await file?.close();
    }
}
