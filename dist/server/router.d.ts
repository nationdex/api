export interface CompiledRoute {
    method: string;
    segments: string[];
    paramNames: (string | null)[];
    handler: (response: any, request: any) => void | Promise<void>;
}
export declare function compileRoute(method: string, url: string, handler: (response: any, request: any) => void | Promise<void>): CompiledRoute;
export declare function matchRoute(routes: CompiledRoute[], method: string, pathname: string): {
    route: CompiledRoute;
    params: string[];
} | null;
//# sourceMappingURL=router.d.ts.map