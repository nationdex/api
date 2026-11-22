import type { CompiledRoute } from "./router";
import { compileRoute, matchRoute } from "./router";

type ResponseBody = ConstructorParameters<typeof Response>[0];

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

  end(body?: ResponseBody): this {
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

export interface CorsOptions {
  /** Exact browser origins, including scheme and optional port. Wildcards are rejected. */
  origins: string[] | (() => string[] | Promise<string[]>);
  /** Restrict CORS to one or more path prefixes, for example /v1/extras. */
  pathPrefix: string | string[];
}

export class BunApp {
  private routes: CompiledRoute[] = [];
  private server: Bun.Server<undefined> | null = null;

  constructor(
    private tls?: Bun.TLSOptions,
    private cors?: CorsOptions,
  ) {
    if (cors) {
      const prefixes = Array.isArray(cors.pathPrefix)
        ? cors.pathPrefix
        : [cors.pathPrefix];
      if (
        !prefixes.length ||
        prefixes.some(
          (prefix) =>
            !prefix.startsWith("/") ||
            prefix.includes("?") ||
            prefix.includes("#"),
        )
      )
        throw new Error("CORS needs absolute path prefixes");
      if (Array.isArray(cors.origins))
        for (const origin of cors.origins) {
          const parsed = new URL(origin);
          if (
            !["https:", "http:"].includes(parsed.protocol) ||
            parsed.origin !== origin
          )
            throw new Error("CORS origins must be exact HTTP(S) origins");
        }
    }
  }

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
    const prefixes = this.cors
      ? (Array.isArray(this.cors.pathPrefix)
          ? this.cors.pathPrefix
          : [this.cors.pathPrefix]
        ).map((prefix) => prefix.replace(/\/$/, ""))
      : [];
    const corsApplies = prefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
    );
    const origin = request.headers.get("origin");
    let corsOrigins: string[] = [];
    if (corsApplies && this.cors) {
      try {
        corsOrigins =
          typeof this.cors.origins === "function"
            ? await this.cors.origins()
            : this.cors.origins;
      } catch {
        corsOrigins = [];
      }
      corsOrigins = corsOrigins.filter((allowedOrigin) => {
        try {
          const parsed = new URL(allowedOrigin);
          return (
            ["http:", "https:"].includes(parsed.protocol) &&
            parsed.origin === allowedOrigin
          );
        } catch {
          return false;
        }
      });
    }
    if (corsApplies && origin && !corsOrigins.includes(origin))
      return new Response("Origin denied", { status: 403 });
    const finish = (response: Response): Response => {
      if (!corsApplies || !origin) return response;
      const headers = new Headers(response.headers);
      headers.set("Access-Control-Allow-Origin", origin);
      headers.append("Vary", "Origin");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    };
    if (corsApplies && origin && request.method === "OPTIONS") {
      const method = request.headers.get("access-control-request-method");
      const headers = (
        request.headers.get("access-control-request-headers") ?? ""
      )
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);
      if (
        !method ||
        !["GET", "POST", "DELETE"].includes(method) ||
        headers.some(
          (header) => !["authorization", "content-type"].includes(header),
        )
      )
        return finish(new Response("Preflight denied", { status: 403 }));
      return finish(
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Methods": "GET, POST, DELETE",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
            "Access-Control-Max-Age": "600",
          },
        }),
      );
    }
    const match = matchRoute(
      this.routes,
      request.method.toUpperCase(),
      pathname,
    );
    if (!match) return finish(new Response("Not Found", { status: 404 }));

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

    return finish(
      res.result ??
        new Response("Route did not send a response", { status: 500 }),
    );
  }
}
