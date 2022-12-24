"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var error_manager_1 = __importDefault(require("@winkgroup/error-manager"));
var ErrorManagerCrudMongo = /** @class */ (function (_super) {
    __extends(ErrorManagerCrudMongo, _super);
    function ErrorManagerCrudMongo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ErrorManagerCrudMongo.prototype.senderOrNextEndpointIfItNotAnObjectId = function (res, next, e) {
        if (e instanceof Error && e.name === "CastError") {
            // @ts-ignore: line
            if (e.path === '_id' && e.kind === 'ObjectId') {
                next();
                return;
            }
        }
        this.sender(res, e);
    };
    return ErrorManagerCrudMongo;
}(error_manager_1.default));
exports.default = ErrorManagerCrudMongo;
