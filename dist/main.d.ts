import { ForgeExtension, ForgeClient } from "@tryforge/forgescript";
import { APIOptions } from "./api";
export declare class API extends ForgeExtension {
    name: string;
    description: string;
    version: string;
    options: APIOptions;
    constructor(options?: APIOptions);
    init(client: ForgeClient): void;
}
