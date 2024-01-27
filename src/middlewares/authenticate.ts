import {NextFunction, Request, Response} from "express";
import * as jwt from 'jsonwebtoken';
import fs from "fs";
import {TUser} from "../types/user";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {

    if (req.headers.authorization === undefined || !req.headers.authorization.startsWith('Bearer ')) {
        console.log()
        return next({
            message: "Unauthorized",
            authorization: req.headers.authorization
        })
    }

    const token = req.headers.authorization.split(" ")[1]
    const privateKey = fs.readFileSync('private.key');
    const decodedUser = jwt.verify(token, privateKey) as (TUser & {
        iat?: number
    });
    delete decodedUser.iat;
    req.user = decodedUser;

    if (req.user === undefined) {
        return next("Unauthorized")
    }
    next()
}
