# @nationdex/api

Bun HTTP server extension for Project Nationdex 2026. Requires Bun 1.4.3 or newer and ForgeScript 2.8.0 or a compatible 2.x release.

## Install

```sh
bun add github:nationdex/api @tryforge/forgescript@^2.8.0
```

The package exports TypeScript source. Bun runs it directly. Use `bun run format` to format the source.

## Routes

Add `new API({ path: "src/api_routes", port: 2222 })` to the ForgeClient extensions, or call `api.init(client)` if startup is managed by the bot. The route directory is relative to the working directory and is scanned recursively. Each JavaScript or TypeScript module can export a single route or an array.

```ts
export default {
  url: "/users/:id",
  method: "GET",
  code: "$sendJson[{\"id\":\"$getParameter[id]\"}]",
};
```

The available route functions are `$getBody`, `$getHeader`, `$getParameter`, `$getQuery`, `$sendJson`, `$sendFile`, and `$writeStatus`. End each route with a response function. Paths passed to `$sendFile` should come from application configuration or a validated lookup.

Global `allowed` rules can restrict hosts, IPs, and headers. Each route can inherit, replace, merge, or disable those rules. Optional in-memory `throttle` settings apply by remote IP, and routes can opt out with `throttle: false`. For HTTPS, pass Bun TLS options as `tls`.

## Upgrading the Nationdex bot from 1.x

The bot can keep scanning and importing `@nationdex/api/dist/functions/**/*.js` during the transition. These checked-in JavaScript files forward to the TypeScript source. Paths for removed functions return `false` so the bot's existing filter skips them, including when it uses an older generated import list.

When the bot switches to the source entry point, remove its API function scan from `src/scripts/bundle-prep.ts` and regenerate the bundle imports. If the bot needs the functions before `api.init(dex)`, import `apiFunctions` from `@nationdex/api` and call `FunctionManager.addMany(apiFunctions)`.

The old `ssl` option becomes `tls`. For certificates stored on disk, pass `{ cert: Bun.file(certPath), key: Bun.file(keyPath) }`. To reload routes programmatically, import and await `updateRoutes()`.

The 1.x package and the original bot bundle configuration can be pinned together to roll back.

### Browser clients

CORS is opt-in and accepts exact HTTP(S) origins, either as a static list or an
async provider resolved for each request. A path prefix can be one path or a
list:

```ts
new API({
  path: "src/api_routes",
  cors: {
    origins: async () => readApprovedOrigins(),
    pathPrefix: ["/v1/extras", "/v1/discovery"],
  },
});
```

It allows GET, POST and DELETE requests with Authorization and Content-Type
headers within the configured prefix. Credentials/cookies are not enabled.
Requests without an Origin header still require authentication in the route;
CORS is a browser policy, not an authorization mechanism.
