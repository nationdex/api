import { ForgeExtension, ForgeClient } from "@tryforge/forgescript";
import { ApiOptions } from "./api";
export declare class Api extends ForgeExtension {
    name: string;
    description: string;
    version: string;
    options: ApiOptions;
    constructor(options?: ApiOptions);
    init(client: ForgeClient): void;
}
