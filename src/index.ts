import express from "express"
import {expressjwt as jwt} from 'express-jwt'
import _ from "lodash"
import { Document, Model, Query } from 'mongoose'
import Db, { MaterialTableSearch } from "@winkgroup/db-mongo"
import Env from "@winkgroup/env"
import ErrorManager from "@winkgroup/error-manager"

export interface MaterialTableOptions {
    searchFunc?: (search:string) => any
}

export interface CrudMongoOptions<Doc extends Document> {
    getModel: () => Promise< Model<Doc> >
    materialTable?: MaterialTableOptions
    protectEndpoints?: boolean
}

export default class CrudMongo<Doc extends Document> {
    private model = null as Model<Doc> | null
    private retrieveModel: () => Promise< Model<Doc> >
    protectEndpoints:boolean
    materialTableOptions?: MaterialTableOptions

    constructor(inputOptions:CrudMongoOptions<Doc>) {
        const options = _.defaults(inputOptions, {
            protectEndpoints: true
        })
        this.retrieveModel = options.getModel
        this.protectEndpoints = options.protectEndpoints
        this.materialTableOptions = options.materialTable
    }

    async getModel() {
        if (this.model) return this.model
        this.model = await this.retrieveModel()
        return this.model
    }

    async getResult(doc:Doc, covertUnderscoreId = false):Promise<any> {
        let result = doc.toObject({versionKey: false})
        if (covertUnderscoreId && result._id) {
            result.id = result._id
            delete result._id
        }
        return result
    }

    async getDocById(id:string, res:express.Response) {
        const model = await this.getModel()
        const doc = await model.findById(id)
        if (!doc) res.status(404).send('not found')
        return doc
    }

    setRouterEndpoints(router:express.Router) {
        if (this.protectEndpoints) {
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

        router.get('/', async (req, res) => {
            try {
                const model = await this.getModel()
                const list = await model.find({})
                const result = await Promise.all( list.map( (doc:Doc) => this.getResult(doc, true) ) )
                res.json(result)
            } catch (e) {
                ErrorManager.sender(e, res)
            }
        })

        router.post('/', async (req, res) => {
            try {
                const model = await this.getModel()
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
                const Model = await this.getModel()
                let query:Query<Doc[], Doc>
                const materialTableSearch = req.body  as MaterialTableSearch
                const searchTransformation = this.materialTableOptions && this.materialTableOptions.searchFunc
                if (materialTableSearch.search && searchTransformation)
                    query = Model.find( searchTransformation(materialTableSearch.search) )
                    else query = Model.find()
                const result = await Db.fromQueryToMaterialTableData(query, materialTableSearch)
                result.data = await Promise.all( result.data.map( doc => this.getResult(doc, true) ) )
                res.status(200).json(result)
            })
        }

        router.get('/:id', async (req, res) => {
            try {
                const doc = await this.getDocById(req.params.id, res)
                if (!doc) return
                const result = await this.getResult(doc, true)
                res.json( result )
            } catch (e) {
                ErrorManager.sender(e, res)
            }
        })

        router.patch('/:id', async (req, res) => {
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
                ErrorManager.sender(e, res)
            }
        })

        router.delete('/:id', async (req, res) => {
            try {
                const doc = await this.getDocById(req.params.id, res)
                if (!doc) return
                await doc.remove()
                res.json()
            } catch (e) {
                ErrorManager.sender(e, res)
            }
        })
    }
}