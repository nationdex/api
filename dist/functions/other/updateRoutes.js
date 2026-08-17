"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const api_1 = require("../../api");
exports.default = new forgescript_1.NativeFunction({
    name: "$updateRoutes",
    description: "Reload all routes from the previously set directory",
    version: "1.3.0",
    unwrap: false,
    async execute(ctx) {
        await (0, api_1.updateRoutes)();
        return this.success();
    }
});
