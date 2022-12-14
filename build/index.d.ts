/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import express from "express";
import { Document, Model } from 'mongoose';
import ErrorManagerCrudMongo from "./errorManager";
export interface MaterialTableOptions {
    searchFunc?: (search: string) => any;
}
export interface CrudMongoOptions<Doc extends Document> {
    model: Model<Doc>;
    materialTable?: MaterialTableOptions;
    protectEndpoints?: boolean;
    jwtSecret?: string;
}
export default class CrudMongo<Doc extends Document> {
    private CrudModel;
    protectEndpoints: boolean;
    materialTableOptions?: MaterialTableOptions;
    jwtSecret: string;
    constructor(inputOptions: CrudMongoOptions<Doc>);
    getResult(doc: Doc, convertUnderscoreId?: boolean): Promise<any>;
    getDocById(id: string, res: express.Response): Promise<import("mongoose").HydratedDocument<Doc, {}, {}> | null>;
    setProtection(router: express.Router): void;
    getErrorManager(): ErrorManagerCrudMongo;
    setRouterEndpoints(router: express.Router): void;
}
