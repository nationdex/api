import { ForgeExtension, ForgeClient } from "@tryforge/forgescript";
import { QuorielApiOptions } from "./api";
export declare class QuorielApi extends ForgeExtension {
    name: string;
    description: string;
    version: string;
    options: QuorielApiOptions;
    constructor(options?: QuorielApiOptions);
    init(client: ForgeClient): void;
}
