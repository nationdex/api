import { ForgeExtension, ForgeClient } from "@tryforge/forgescript";
import { initializer, APIOptions } from "./api";

const pkg = require("../package.json");

export class API extends ForgeExtension {
    public name = "API";
    public description: string = pkg.description;
    public version: string = pkg.version;
    public options: APIOptions;

    public constructor(options: APIOptions = {}) {
        super();
        this.options = options;
    }

    public init(client: ForgeClient): void {
        this.load(__dirname + "/functions");
        initializer(this.options, client);
    }
}
