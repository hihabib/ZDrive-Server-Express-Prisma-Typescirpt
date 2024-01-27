import {NextFunction, Request, Response} from 'express'
import {TUser} from "../types/user";
import * as service from '../services/user'

/**
 * User registration Controller
 * @param req
 * @param res
 * @param next
 */
export const registration = (req: Request, res: Response, next: NextFunction) => {
    (async () => {
        try {
            const {
                name,
                username,
                password,
                email
            }: TUser = req.body;
            if (name !== undefined && username !== undefined && password !== undefined && email !== undefined) {
                // save user and response
                res.status(201).json(await service.saveUser(name, username, email, password))
            } else {
                res.status(401).json({message: "necessary data is missing"})
            }
        } catch (error) {
            if (error instanceof Error) {
                next(error)
            }
        }
    })()
}

/**
 * User login controller
 * @param req
 * @param res
 * @param next
 */
export const login = (req: Request, res: Response, next: NextFunction) => {
    (async () => {
        try {
            const {
                username,
                password
            }: { username: string, password: string } = req.body;
            res.status(200).json(await service.login(username, password))
        } catch (error) {
            if (error instanceof Error) {
                next(error)
            }
        }
    })()
}
