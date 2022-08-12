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
export interface MaterialTableOptions {
    searchFunc?: (search: string) => any;
}
export interface CrudMongoOptions<Doc extends Document> {
    getModel: () => Promise<Model<Doc>>;
    materialTable?: MaterialTableOptions;
    protectEndpoints?: boolean;
}
export default class CrudMongo<Doc extends Document> {
    private model;
    private retrieveModel;
    protectEndpoints: boolean;
    materialTableOptions?: MaterialTableOptions;
    constructor(inputOptions: CrudMongoOptions<Doc>);
    getModel(): Promise<Model<Doc, {}, {}, {}, any>>;
    getResult(doc: Doc, covertUnderscoreId?: boolean): Promise<any>;
    getDocById(id: string, res: express.Response): Promise<import("mongoose").HydratedDocument<Doc, {}, {}> | null>;
    setRouterEndpoints(router: express.Router): void;
}
