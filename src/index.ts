import Db from '@winkgroup/db-mongo';
import { DataGridQuery } from '@winkgroup/db-mongo';
import express from 'express';
import { expressjwt as jwt } from 'express-jwt';
import _ from 'lodash';
import { Document, Model, Query } from 'mongoose';
import ErrorManagerCrudMongo from './errorManager';

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
    private CrudModel: Model<Doc>;
    protectEndpoints: boolean;
    materialTableOptions?: MaterialTableOptions;
    jwtSecret: string;

    constructor(inputOptions: CrudMongoOptions<Doc>) {
        const options = _.defaults(inputOptions, {
            protectEndpoints: false,
            jwtSecret: '',
        });
        this.protectEndpoints = options.protectEndpoints;
        this.materialTableOptions = options.materialTable;
        this.CrudModel = inputOptions.model;
        this.jwtSecret = options.jwtSecret;

        if (!this.jwtSecret && this.protectEndpoints)
            throw new Error(
                'please set jwtSecret in order to protected crudMongo endpoints'
            );
    }

    async getResult(doc: Doc, convertUnderscoreId = false): Promise<any> {
        let result = doc.toObject({ versionKey: false });
        if (convertUnderscoreId && result._id) {
            result.id = result._id;
            delete result._id;
        }
        return result;
    }

    async getDocById(id: string, res: express.Response) {
        const doc = await this.CrudModel.findById(id);
        if (!doc) res.status(404).send('not found');
        return doc;
    }

    setProtection(router: express.Router) {
        router.use(
            jwt({
                secret: this.jwtSecret,
                algorithms: ['RS256', 'HS256'],
            })
        );

        router.use((err: any, req: any, res: any, next: any) => {
            if (err.name === 'UnauthorizedError') {
                console.error(err);
                res.status(err.status).send(err.message);
                return;
            }
            next();
        });
    }

    getErrorManager() {
        const errorManager = new ErrorManagerCrudMongo();
        return errorManager;
    }

    setRouterEndpoints(router: express.Router) {
        if (this.protectEndpoints) this.setProtection(router);
        const errorManager = this.getErrorManager();

        router.get('/', async (req, res) => {
            try {
                const model = this.CrudModel;
                const list = await model.find({});
                const result = await Promise.all(
                    list.map((doc: Doc) => this.getResult(doc, true))
                );
                res.json(result);
            } catch (e) {
                errorManager.sender(res, e);
            }
        });

        router.post('/', async (req, res) => {
            try {
                const model = this.CrudModel;
                const doc = new model(req.body);
                await doc.save();
                const result = await this.getResult(doc, true);
                res.json(result);
            } catch (e) {
                errorManager.sender(res, e);
            }
        });

        if (this.materialTableOptions) {
            router.post('/materialTable', async (req, res) => {
                const model = this.CrudModel;
                let query: Query<Doc[], Doc>;
                const materialTableSearch = req.body as DataGridQuery;
                const searchTransformation =
                    this.materialTableOptions &&
                    this.materialTableOptions.searchFunc;
                if (materialTableSearch.search && searchTransformation)
                    query = model.find(
                        searchTransformation(materialTableSearch.search)
                    );
                else query = model.find();
                const result = await Db.fromQueryToMaterialTableData(
                    query,
                    materialTableSearch
                );
                result.data = await Promise.all(
                    result.data.map((doc) => this.getResult(doc, true))
                );
                res.status(200).json(result);
            });
        }

        router.get('/:id', async (req, res, next) => {
            try {
                const doc = await this.getDocById(req.params.id, res);
                if (!doc) return;
                const result = await this.getResult(doc, true);
                res.json(result);
            } catch (e) {
                errorManager.senderOrNextEndpointIfItNotAnObjectId(
                    res,
                    next,
                    e
                );
            }
        });

        router.patch('/:id', async (req, res, next) => {
            try {
                const doc = await this.getDocById(req.params.id, res);
                if (!doc) return;
                for (const key in req.body) {
                    // @ts-ignore
                    doc[key] = req.body[key];
                }
                await doc.save();
                const result = await this.getResult(doc, true);
                res.json(result);
            } catch (e) {
                errorManager.senderOrNextEndpointIfItNotAnObjectId(
                    res,
                    next,
                    e
                );
            }
        });

        router.delete('/:id', async (req, res, next) => {
            try {
                const doc = await this.getDocById(req.params.id, res);
                if (!doc) return;
                await doc.deleteOne();
                res.json();
            } catch (e) {
                errorManager.senderOrNextEndpointIfItNotAnObjectId(
                    res,
                    next,
                    e
                );
            }
        });
    }
}

export { ErrorManagerCrudMongo };
