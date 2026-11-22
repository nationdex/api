import {
  ForgeExtension,
  ForgeClient,
  FunctionManager,
  Logger,
} from "@tryforge/forgescript";
import { initializer, type APIOptions } from "./api";

import getBody from "./functions/get/getBody";
import getHeader from "./functions/get/getHeader";
import getParameter from "./functions/get/getParameter";
import getQuery from "./functions/get/getQuery";
import writeStatus from "./functions/other/writeStatus";
import sendFile from "./functions/send/sendFile";
import sendJson from "./functions/send/sendJson";

export const apiFunctions = [
  getBody,
  getHeader,
  getParameter,
  getQuery,
  writeStatus,
  sendFile,
  sendJson,
];

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
    FunctionManager.addMany(apiFunctions);
    void initializer(this.options, client).catch((error) =>
      Logger.error(error),
    );
  }
}
