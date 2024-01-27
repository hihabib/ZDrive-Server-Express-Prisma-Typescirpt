import {NextFunction, Request, Response} from "express";
import {createDirectory, getItemsFromFs, getRouteFs} from "../utils/tree";
import fs from "fs";
import * as service from '../services/tree'

/**
 * Controller function to get the list of files and directory
 * @param req
 * @param res
 * @param next
 */
export const getItems = (req: Request, res: Response, next: NextFunction) => {
    const route = getRouteFs(req);

    (async () => {
        try {
            const items = await getItemsFromFs(route);
            if (items === undefined) {
                next("Items not found")
            }
            res.status(200).json(items)
        } catch (error) {
            if (error instanceof Error) {
                next(error)
            }
        }
    })();

}

/**
 * Create Directory by user
 * @param req
 * @param res
 * @param next
 */
export const createDirectoryByUser = (req: Request, res: Response, next: NextFunction) => {
    if (req.user === undefined) {
        throw new Error("Unauthorized");
    }

    const route = getRouteFs(req);
    (async () => {
        try {
            if (fs.existsSync(route)) {
                return res.status(401).json({
                    message: "Directory already exists"
                })
            }
            // create directory here
            const isCreated = await createDirectory(route, (req.user!).username)
            if (!isCreated) {
                return next("Directory is not created successfully")
            }
            return res.status(201).json({
                message: "Directory is created successfully"
            })
        } catch (error) {
            if (error instanceof Error) {
                next(error)
            }
        }
    })()

}

export const deleteDirectoryById = (req: Request, res: Response, next: NextFunction) => {
    (async () => {
        try {
            const {id} = req.params;
            const isDeleted = await service.deleteDirectoryById(Number(id))
            res.status(200).json({
                message: "Directory is deleted successfully"
            })
        } catch (error) {
            if (error instanceof Error) {
                next(error)
            }
        }
    })()
}
