"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_jwt_1 = require("express-jwt");
var lodash_1 = __importDefault(require("lodash"));
var db_mongo_1 = __importDefault(require("@winkgroup/db-mongo"));
var env_1 = __importDefault(require("@winkgroup/env"));
var error_manager_1 = __importDefault(require("@winkgroup/error-manager"));
var CrudMongo = /** @class */ (function () {
    function CrudMongo(inputOptions) {
        var options = lodash_1.default.defaults(inputOptions, { protectEndpoints: true });
        this.protectEndpoints = options.protectEndpoints;
        this.materialTableOptions = options.materialTable;
        this.CrudModel = inputOptions.model;
    }
    CrudMongo.prototype.getResult = function (doc, convertUnderscoreId) {
        if (convertUnderscoreId === void 0) { convertUnderscoreId = false; }
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                result = doc.toObject({ versionKey: false });
                if (convertUnderscoreId && result._id) {
                    result.id = result._id;
                    delete result._id;
                }
                return [2 /*return*/, result];
            });
        });
    };
    CrudMongo.prototype.getDocById = function (id, res) {
        return __awaiter(this, void 0, void 0, function () {
            var doc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.CrudModel.findById(id)];
                    case 1:
                        doc = _a.sent();
                        if (!doc)
                            res.status(404).send('not found');
                        return [2 /*return*/, doc];
                }
            });
        });
    };
    CrudMongo.prototype.setProtection = function (router) {
        router.use((0, express_jwt_1.expressjwt)({
            secret: env_1.default.get('JWT_SECRET'),
            algorithms: ['RS256', 'HS256']
        }));
        router.use(function (err, req, res, next) {
            if (err.name === 'UnauthorizedError') {
                console.error(err);
                res.status(err.status).send(err.message);
                return;
            }
            next();
        });
    };
    CrudMongo.prototype.objectIdErrorManager = function (e, res, next) {
        if (e instanceof Error && e.name === "CastError") {
            // @ts-ignore: line
            if (e.path === '_id' && e.kind === 'ObjectId') {
                next();
                return;
            }
        }
        error_manager_1.default.sender(e, res);
    };
    CrudMongo.prototype.setRouterEndpoints = function (router) {
        var _this = this;
        if (this.protectEndpoints)
            this.setProtection(router);
        router.get('/', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var model, list, result, e_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        model = this.CrudModel;
                        return [4 /*yield*/, model.find({})];
                    case 1:
                        list = _a.sent();
                        return [4 /*yield*/, Promise.all(list.map(function (doc) { return _this.getResult(doc, true); }))];
                    case 2:
                        result = _a.sent();
                        res.json(result);
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        error_manager_1.default.sender(e_1, res);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        router.post('/', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var model, doc, result, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        model = this.CrudModel;
                        doc = new model(req.body);
                        return [4 /*yield*/, doc.save()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getResult(doc, true)];
                    case 2:
                        result = _a.sent();
                        res.json(result);
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        error_manager_1.default.sender(e_2, res);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        if (this.materialTableOptions) {
            router.post('/materialTable', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var model, query, materialTableSearch, searchTransformation, result, _a;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            model = this.CrudModel;
                            materialTableSearch = req.body;
                            searchTransformation = this.materialTableOptions && this.materialTableOptions.searchFunc;
                            if (materialTableSearch.search && searchTransformation)
                                query = model.find(searchTransformation(materialTableSearch.search));
                            else
                                query = model.find();
                            return [4 /*yield*/, db_mongo_1.default.fromQueryToMaterialTableData(query, materialTableSearch)];
                        case 1:
                            result = _b.sent();
                            _a = result;
                            return [4 /*yield*/, Promise.all(result.data.map(function (doc) { return _this.getResult(doc, true); }))];
                        case 2:
                            _a.data = _b.sent();
                            res.status(200).json(result);
                            return [2 /*return*/];
                    }
                });
            }); });
        }
        router.get('/:id', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var doc, result, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getDocById(req.params.id, res)];
                    case 1:
                        doc = _a.sent();
                        if (!doc)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.getResult(doc, true)];
                    case 2:
                        result = _a.sent();
                        res.json(result);
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _a.sent();
                        this.objectIdErrorManager(e_3, res, next);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        router.patch('/:id', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var doc, key, result, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getDocById(req.params.id, res)];
                    case 1:
                        doc = _a.sent();
                        if (!doc)
                            return [2 /*return*/];
                        for (key in req.body) {
                            // @ts-ignore
                            doc[key] = req.body[key];
                        }
                        return [4 /*yield*/, doc.save()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.getResult(doc, true)];
                    case 3:
                        result = _a.sent();
                        res.json(result);
                        return [3 /*break*/, 5];
                    case 4:
                        e_4 = _a.sent();
                        this.objectIdErrorManager(e_4, res, next);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        router.delete('/:id', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var doc, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getDocById(req.params.id, res)];
                    case 1:
                        doc = _a.sent();
                        if (!doc)
                            return [2 /*return*/];
                        return [4 /*yield*/, doc.remove()];
                    case 2:
                        _a.sent();
                        res.json();
                        return [3 /*break*/, 4];
                    case 3:
                        e_5 = _a.sent();
                        this.objectIdErrorManager(e_5, res, next);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    return CrudMongo;
}());
exports.default = CrudMongo;
