import { Response, NextFunction } from 'express';
import ErrorManagerServer from '@winkgroup/error-manager';

export default class ErrorManagerCrudMongo extends ErrorManagerServer {
    senderOrNextEndpointIfItNotAnObjectId(
        res: Response,
        next: NextFunction,
        e?: unknown
    ) {
        if (e instanceof Error && e.name === 'CastError') {
            // @ts-ignore: line
            if (e.path === '_id' && e.kind === 'ObjectId') {
                next();
                return;
            }
        }

        this.sender(res, e);
    }
}
