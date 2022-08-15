import express, { NextFunction } from "express"
import {expressjwt as jwt} from 'express-jwt'
import _ from "lodash"
import { Document, Model, Query } from 'mongoose'
import Db from "@winkgroup/db-mongo"
import Env from "@winkgroup/env"
import ErrorManager from "@winkgroup/error-manager"
import { DataGridQuery } from "@winkgroup/db-mongo/build/commons"

export interface MaterialTableOptions {
    searchFunc?: (search:string) => any
}

export interface CrudMongoOptions<Doc extends Document> {
    model: Model<Doc>
    materialTable?: MaterialTableOptions
    protectEndpoints?: boolean
}

export default class CrudMongo<Doc extends Document> {
    private CrudModel:Model<Doc>
    protectEndpoints:boolean
    materialTableOptions?: MaterialTableOptions

    constructor(inputOptions:CrudMongoOptions<Doc>) {
        const options = _.defaults(inputOptions, { protectEndpoints: true })
        this.protectEndpoints = options.protectEndpoints
        this.materialTableOptions = options.materialTable
        this.CrudModel = inputOptions.model
    }

    async getResult(doc:Doc, convertUnderscoreId = false):Promise<any> {
        let result = doc.toObject({versionKey: false})
        if (convertUnderscoreId && result._id) {
            result.id = result._id
            delete result._id
        }
        return result
    }

    async getDocById(id:string, res:express.Response) {
        const doc = await this.CrudModel.findById(id)
        if (!doc) res.status(404).send('not found')
        return doc
    }

    setProtection(router:express.Router) {
        router.use (jwt({
            secret: Env.get('JWT_SECRET'),
            algorithms: ['RS256', 'HS256']
        }))

        router.use((err:any, req:any, res:any, next:any) => {
            if(err.name === 'UnauthorizedError') {
                console.error(err)
                res.status(err.status).send( err.message )
                return
            }
            next()
        })
    }

    objectIdErrorManager(e:unknown, res:any, next:NextFunction) {
        if (e instanceof Error && e.name === "CastError") {
            // @ts-ignore: line
            if (e.path === '_id' && e.kind === 'ObjectId') {
                next()
                return
            }
        }
        ErrorManager.sender(e, res)
    }

    setRouterEndpoints(router:express.Router) {
        if (this.protectEndpoints) this.setProtection(router)

        router.get('/', async (req, res) => {
            try {
                const model = this.CrudModel
                const list = await model.find({})
                const result = await Promise.all( list.map( (doc:Doc) => this.getResult(doc, true) ) )
                res.json(result)
            } catch (e) {
                ErrorManager.sender(e, res)
            }
        })

        router.post('/', async (req, res) => {
            try {
                const model = this.CrudModel
                const doc = new model(req.body)
                await doc.save()
                const result = await this.getResult(doc, true)
                res.json( result )
            } catch (e) {
                ErrorManager.sender(e, res)
            }
        })

        if (this.materialTableOptions) {
            router.post('/materialTable', async (req, res) => {
                const model = this.CrudModel
                let query:Query<Doc[], Doc>
                const materialTableSearch = req.body  as DataGridQuery
                const searchTransformation = this.materialTableOptions && this.materialTableOptions.searchFunc
                if (materialTableSearch.search && searchTransformation)
                    query = model.find( searchTransformation(materialTableSearch.search) )
                    else query = model.find()
                const result = await Db.fromQueryToMaterialTableData(query, materialTableSearch)
                result.data = await Promise.all( result.data.map( doc => this.getResult(doc, true) ) )
                res.status(200).json(result)
            })
        }

        router.get('/:id', async (req, res, next) => {
            try {
                const doc = await this.getDocById(req.params.id, res)
                if (!doc) return
                const result = await this.getResult(doc, true)
                res.json( result )
            } catch (e) {
                this.objectIdErrorManager(e, res, next)
            }
        })

        router.patch('/:id', async (req, res, next) => {
            try {
                const doc = await this.getDocById(req.params.id, res)
                if (!doc) return
                for (const key in req.body) {
                    // @ts-ignore
                    doc[key] = req.body[key]
                }
                await doc.save()
                const result = await this.getResult(doc, true)
                res.json( result )
            } catch (e) {
                this.objectIdErrorManager(e, res, next)
            }
        })

        router.delete('/:id', async (req, res, next) => {
            try {
                const doc = await this.getDocById(req.params.id, res)
                if (!doc) return
                await doc.remove()
                res.json()
            } catch (e) {
                this.objectIdErrorManager(e, res, next)
            }
        })
    }
}