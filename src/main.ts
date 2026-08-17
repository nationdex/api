import { ForgeExtension, ForgeClient } from "@tryforge/forgescript";
import { initializer, QuorielApiOptions } from "./api";

const pkg = require("../package.json");

export class QuorielApi extends ForgeExtension {
    public name = "QuorielApi";
    public description: string = pkg.description;
    public version: string = pkg.version;
    public options: QuorielApiOptions;

    public constructor(options: QuorielApiOptions = {}) {
        super();
        this.options = options;
    }

    public init(client: ForgeClient): void {
        this.load(__dirname + "/functions");
        initializer(this.options, client);
    }
}
