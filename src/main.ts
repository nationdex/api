import { ForgeExtension, ForgeClient } from "@tryforge/forgescript";
import { initializer, ApiOptions } from "./api";

const pkg = require("../package.json");

export class Api extends ForgeExtension {
    public name = "Api";
    public description: string = pkg.description;
    public version: string = pkg.version;
    public options: ApiOptions;

    public constructor(options: ApiOptions = {}) {
        super();
        this.options = options;
    }

    public init(client: ForgeClient): void {
        this.load(__dirname + "/functions");
        initializer(this.options, client);
    }
}
