export interface ThrottleOptions {
    logBlocks?: boolean;
    rateWindowMs?: number;
    rateMaxRequests?: number;
    burstWindowMs?: number;
    burstMaxRequests?: number;
    blockDuration?: number;
    cleanupIntervalMs?: number;
    maxTrackedIPs?: number;
}
export declare function setupThrottle(options?: boolean | ThrottleOptions): void;
export declare function checkThrottle(ip: string | null): boolean;
export declare function throttleStats(): {
    rateTracking: number;
    burstTracking: number;
    blockedIPs: number;
};
