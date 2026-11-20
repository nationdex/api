import type { CompiledRoute } from "./router";
import { compileRoute, matchRoute } from "./router";

export class BunHttpRequest {
  private url: URL;
  private body?: Promise<string>;
  private params: string[];
  private paramNames: (string | null)[];

  constructor(
    public raw: Request,
    params: string[],
    paramNames: (string | null)[],
  ) {
    this.url = new URL(raw.url);
    this.params = params;
    this.paramNames = paramNames;
  }

  getHeader(key: string): string {
    return this.raw.headers.get(key) ?? "";
  }

  getQuery(key: string): string {
    return this.url.searchParams.get(key) ?? "";
  }

  text(): Promise<string> {
    return (this.body ??= this.raw.text());
  }

  getParameter(param: string | number): string {
    if (typeof param === "number") return this.params[param] ?? "";
    const namedIndex = this.paramNames.filter((n) => n !== null).indexOf(param);
    return namedIndex === -1 ? "" : (this.params[namedIndex] ?? "");
  }
}

export class BunHttpResponse {
  private status = 200;
  private headers = new Headers();
  public result?: Response;

  constructor(
    private request: Request,
    private server: Bun.Server<undefined>,
  ) {}

  writeStatus(status: string): this {
    this.status = parseInt(status, 10);
    return this;
  }

  writeHeader(key: string, value: string): this {
    this.headers.set(key, value);
    return this;
  }

  end(body?: BodyInit): this {
    this.result ??= new Response(
      [204, 205, 304].includes(this.status) ? null : body,
      { status: this.status, headers: this.headers },
    );
    return this;
  }

  getRemoteAddress(): string {
    return this.server.requestIP(this.request)?.address ?? "";
  }

  isAborted(): boolean {
    return this.request.signal.aborted;
  }
}

export class BunApp {
  private routes: CompiledRoute[] = [];
  private server: Bun.Server<undefined> | null = null;

  constructor(private tls?: Bun.TLSOptions) {}

  addRoute(
    method: string,
    url: string,
    handler: CompiledRoute["handler"],
  ): void {
    this.routes.push(compileRoute(method, url, handler));
  }

  listen(port: number, cb: (ok: boolean) => void): void {
    try {
      this.server = Bun.serve({
        port,
        tls: this.tls,
        fetch: (request: Request, server: Bun.Server<undefined>) =>
          this.handle(request, server),
      });
      cb(true);
    } catch {
      cb(false);
    }
  }

  close(): void {
    this.server?.stop(true);
    this.server = null;
  }

  private async handle(
    request: Request,
    server: Bun.Server<undefined>,
  ): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    const match = matchRoute(
      this.routes,
      request.method.toUpperCase(),
      pathname,
    );
    if (!match) return new Response("Not Found", { status: 404 });

    const req = new BunHttpRequest(
      request,
      match.params,
      match.route.paramNames,
    );
    const res = new BunHttpResponse(request, server);

    try {
      await match.route.handler(res, req);
    } catch {
      if (!res.isAborted()) res.writeStatus("500").end("Internal Server Error");
    }

    return (
      res.result ??
      new Response("Route did not send a response", { status: 500 })
    );
  }
}
