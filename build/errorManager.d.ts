import { Response, NextFunction } from "express";
import ErrorManagerServer from "@winkgroup/error-manager";
export default class ErrorManagerCrudMongo extends ErrorManagerServer {
    senderOrNextEndpointIfItNotAnObjectId(res: Response, next: NextFunction, e?: unknown): void;
}
