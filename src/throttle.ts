import { Logger } from "@tryforge/forgescript";

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

interface TrackRecord {
    count: number;
    time: number;
}

const rateTracking = new Map<string, TrackRecord>();
const burstTracking = new Map<string, TrackRecord>();
const blockedIPs = new Map<string, number>();

let rateWindowMs = 60000;
let rateMaxRequests = 60;
let burstWindowMs = 1000;
let burstMaxRequests = 3;
let blockDuration = 600000;
let cleanupIntervalMs = 180000;
let maxTrackedIPs = 1500;
let logBlocks = false;

export function setupThrottle(options: boolean | ThrottleOptions = {}): void {
    if (typeof options === "boolean") {
        if (!options) return;
        options = {};
    }
    if (options.logBlocks) logBlocks = true;
    rateWindowMs = +options.rateWindowMs! || 60000;
    rateMaxRequests = +options.rateMaxRequests! || 60;
    burstWindowMs = +options.burstWindowMs! || 1000;
    burstMaxRequests = +options.burstMaxRequests! || 3;
    blockDuration = +options.blockDuration! || 600000;
    cleanupIntervalMs = +options.cleanupIntervalMs! || 180000;
    maxTrackedIPs = +options.maxTrackedIPs! || 1500;
    setInterval(() => {
        const now = Date.now();
        for (const entry of rateTracking.entries()) if (now > entry[1].time) rateTracking.delete(entry[0]);
        for (const entry of burstTracking.entries()) if (now > entry[1].time) burstTracking.delete(entry[0]);
        for (const entry of blockedIPs.entries()) if (now >= entry[1]) blockedIPs.delete(entry[0]);
    }, cleanupIntervalMs);
}

export function checkThrottle(ip: string | null): boolean {
    if (!ip) return false;
    const now = Date.now();
    const blockedUntil = blockedIPs.get(ip);
    if (blockedUntil !== undefined) {
        if (now < blockedUntil) return true;
        blockedIPs.delete(ip);
    }
    if (burstTracking.size >= maxTrackedIPs) {
        const firstKey = burstTracking.keys().next().value;
        if (firstKey !== undefined) burstTracking.delete(firstKey);
    }
    if (!burstTracking.has(ip)) {
        burstTracking.set(ip, { count: 1, time: now + burstWindowMs });
    } else {
        const burstRecord = burstTracking.get(ip)!;
        if (now > burstRecord.time) {
            burstRecord.count = 1;
            burstRecord.time = now + burstWindowMs;
        } else {
            burstRecord.count++;
            if (burstRecord.count > burstMaxRequests) {
                if (logBlocks) Logger.warn(`IP ${ip} blocked due to burst limit!`);
                blockIP(ip, now, "burst");
                return true;
            }
        }
    }
    if (rateTracking.size >= maxTrackedIPs) {
        const firstKey = rateTracking.keys().next().value;
        if (firstKey !== undefined) rateTracking.delete(firstKey);
    }
    if (!rateTracking.has(ip)) {
        rateTracking.set(ip, { count: 1, time: now + rateWindowMs });
        return false;
    }
    const record = rateTracking.get(ip)!;
    if (now > record.time) {
        record.count = 1;
        record.time = now + rateWindowMs;
        return false;
    }
    if (record.count >= rateMaxRequests) {
        if (logBlocks) Logger.warn(`IP ${ip} blocked due to rate limit!`);
        blockIP(ip, now, "throttle");
        return true;
    }
    record.count++;
    return false;
}

function blockIP(ip: string, now: number, reason: string): void {
    let duration = blockDuration;
    if (reason === "burst") duration *= 2;
    if (blockedIPs.size >= maxTrackedIPs) {
        const firstKey = blockedIPs.keys().next().value;
        if (firstKey !== undefined) blockedIPs.delete(firstKey);
    }
    blockedIPs.set(ip, now + duration);
}

export function throttleStats(): { rateTracking: number; burstTracking: number; blockedIPs: number } {
    return {
        rateTracking: rateTracking.size,
        burstTracking: burstTracking.size,
        blockedIPs: blockedIPs.size
    };
}
