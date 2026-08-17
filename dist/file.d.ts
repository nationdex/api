import type { HttpResponse } from "uWebSockets.js";
export declare function streamFile(response: HttpResponse, path: string, headers: Record<string, string>): Promise<void>;
