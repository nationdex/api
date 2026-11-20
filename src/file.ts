import type { BunHttpResponse } from "./server/bun";

export async function streamFile(
  response: BunHttpResponse,
  path: string,
  headers: Record<string, string>,
): Promise<void> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    response.writeStatus("404").end("File not found");
    return;
  }
  const keys = Object.keys(headers);
  for (let i = 0; i < keys.length; i++)
    response.writeHeader(keys[i], headers[keys[i]]);
  response.writeHeader("Content-Length", file.size.toString());
  response.end(file);
}
