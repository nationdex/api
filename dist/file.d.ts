import type { HttpResponse } from "uWebSockets.js";
import { BunHttpResponse } from "./server/bun";
export declare function streamFile(response: HttpResponse | BunHttpResponse, path: string, headers: Record<string, string>): Promise<void>;
//# sourceMappingURL=file.d.ts.map