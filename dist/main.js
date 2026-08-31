"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API = void 0;
const forgescript_1 = require("@tryforge/forgescript");
const api_1 = require("./api");
const pkg = require("../package.json");
class API extends forgescript_1.ForgeExtension {
    name = "API";
    description = pkg.description;
    version = pkg.version;
    options;
    constructor(options = {}) {
        super();
        this.options = options;
    }
    init(client) {
        this.load(__dirname + "/functions");
        (0, api_1.initializer)(this.options, client);
    }
}
exports.API = API;
