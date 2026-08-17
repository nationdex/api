"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupThrottle = setupThrottle;
exports.checkThrottle = checkThrottle;
exports.throttleStats = throttleStats;
const forgescript_1 = require("@tryforge/forgescript");
const rateTracking = new Map();
const burstTracking = new Map();
const blockedIPs = new Map();
let rateWindowMs = 60000;
let rateMaxRequests = 60;
let burstWindowMs = 1000;
let burstMaxRequests = 3;
let blockDuration = 600000;
let cleanupIntervalMs = 180000;
let maxTrackedIPs = 1500;
let logBlocks = false;
function setupThrottle(options = {}) {
    if (typeof options === "boolean") {
        if (!options)
            return;
        options = {};
    }
    if (options.logBlocks)
        logBlocks = true;
    rateWindowMs = +options.rateWindowMs || 60000;
    rateMaxRequests = +options.rateMaxRequests || 60;
    burstWindowMs = +options.burstWindowMs || 1000;
    burstMaxRequests = +options.burstMaxRequests || 3;
    blockDuration = +options.blockDuration || 600000;
    cleanupIntervalMs = +options.cleanupIntervalMs || 180000;
    maxTrackedIPs = +options.maxTrackedIPs || 1500;
    setInterval(() => {
        const now = Date.now();
        for (const entry of rateTracking.entries())
            if (now > entry[1].time)
                rateTracking.delete(entry[0]);
        for (const entry of burstTracking.entries())
            if (now > entry[1].time)
                burstTracking.delete(entry[0]);
        for (const entry of blockedIPs.entries())
            if (now >= entry[1])
                blockedIPs.delete(entry[0]);
    }, cleanupIntervalMs);
}
function checkThrottle(ip) {
    if (!ip)
        return false;
    const now = Date.now();
    const blockedUntil = blockedIPs.get(ip);
    if (blockedUntil !== undefined) {
        if (now < blockedUntil)
            return true;
        blockedIPs.delete(ip);
    }
    if (burstTracking.size >= maxTrackedIPs) {
        const firstKey = burstTracking.keys().next().value;
        if (firstKey !== undefined)
            burstTracking.delete(firstKey);
    }
    if (!burstTracking.has(ip)) {
        burstTracking.set(ip, { count: 1, time: now + burstWindowMs });
    }
    else {
        const burstRecord = burstTracking.get(ip);
        if (now > burstRecord.time) {
            burstRecord.count = 1;
            burstRecord.time = now + burstWindowMs;
        }
        else {
            burstRecord.count++;
            if (burstRecord.count > burstMaxRequests) {
                if (logBlocks)
                    forgescript_1.Logger.warn(`IP ${ip} blocked due to burst limit!`);
                blockIP(ip, now, "burst");
                return true;
            }
        }
    }
    if (rateTracking.size >= maxTrackedIPs) {
        const firstKey = rateTracking.keys().next().value;
        if (firstKey !== undefined)
            rateTracking.delete(firstKey);
    }
    if (!rateTracking.has(ip)) {
        rateTracking.set(ip, { count: 1, time: now + rateWindowMs });
        return false;
    }
    const record = rateTracking.get(ip);
    if (now > record.time) {
        record.count = 1;
        record.time = now + rateWindowMs;
        return false;
    }
    if (record.count >= rateMaxRequests) {
        if (logBlocks)
            forgescript_1.Logger.warn(`IP ${ip} blocked due to rate limit!`);
        blockIP(ip, now, "throttle");
        return true;
    }
    record.count++;
    return false;
}
function blockIP(ip, now, reason) {
    let duration = blockDuration;
    if (reason === "burst")
        duration *= 2;
    if (blockedIPs.size >= maxTrackedIPs) {
        const firstKey = blockedIPs.keys().next().value;
        if (firstKey !== undefined)
            blockedIPs.delete(firstKey);
    }
    blockedIPs.set(ip, now + duration);
}
function throttleStats() {
    return {
        rateTracking: rateTracking.size,
        burstTracking: burstTracking.size,
        blockedIPs: blockedIPs.size
    };
}
