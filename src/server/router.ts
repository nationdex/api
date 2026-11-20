// Tiny path matcher for the Bun backend. uWS has this logic built in natively
// (":name" segments, resolved positionally via getParameter); this reproduces
// just enough of it for Bun.serve()'s manual fetch(request) routing.

export interface CompiledRoute {
  method: string;
  segments: string[];
  paramNames: (string | null)[];
  handler: (response: any, request: any) => void | Promise<void>;
}

export function compileRoute(
  method: string,
  url: string,
  handler: (response: any, request: any) => void | Promise<void>,
): CompiledRoute {
  const segments = url.split("/").filter(Boolean);
  const paramNames = segments.map((s) =>
    s.startsWith(":") ? s.slice(1) : null,
  );
  return { method: method.toUpperCase(), segments, paramNames, handler };
}

export function matchRoute(
  routes: CompiledRoute[],
  method: string,
  pathname: string,
): { route: CompiledRoute; params: string[] } | null {
  const pathSegments = pathname.split("/").filter(Boolean);
  for (const route of routes) {
    if (route.method !== "ANY" && route.method !== method) continue;
    if (route.segments.length !== pathSegments.length) continue;
    const params: string[] = [];
    let matched = true;
    for (let i = 0; i < route.segments.length; i++) {
      if (route.paramNames[i] !== null) {
        params.push(decodeURIComponent(pathSegments[i]));
        continue;
      }
      if (route.segments[i] !== pathSegments[i]) {
        matched = false;
        break;
      }
    }
    if (matched) return { route, params };
  }
  return null;
}
