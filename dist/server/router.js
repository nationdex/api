"use strict";
// Tiny path matcher for the Bun backend. uWS has this logic built in natively
// (":name" segments, resolved positionally via getParameter); this reproduces
// just enough of it for Bun.serve()'s manual fetch(request) routing.
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileRoute = compileRoute;
exports.matchRoute = matchRoute;
function compileRoute(method, url, handler) {
    const segments = url.split("/").filter(Boolean);
    const paramNames = segments.map(s => (s.startsWith(":") ? s.slice(1) : null));
    return { method: method.toUpperCase(), segments, paramNames, handler };
}
function matchRoute(routes, method, pathname) {
    const pathSegments = pathname.split("/").filter(Boolean);
    for (const route of routes) {
        if (route.method !== "ANY" && route.method !== method)
            continue;
        if (route.segments.length !== pathSegments.length)
            continue;
        const params = [];
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
        if (matched)
            return { route, params };
    }
    return null;
}
//# sourceMappingURL=router.js.map