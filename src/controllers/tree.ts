import {NextFunction, Request, Response} from "express";
import {createDirectory, getRouteFs} from "../utils/tree";
import fs from "fs";
import * as service from '../services/tree'
import {isError} from "../utils/error";

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
            const items = await service.getItemsByRoute(route);
            if (isError(items)) {
                // not found
                return res.status(404).json(items)
            }
            if (items === undefined) {
                return res.status(501).json("Something went wrong")
            }
            return res.status(200).json(items)
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
            const directory = await createDirectory(route, (req.user!).username)
            if (directory === false || directory === undefined) {
                return res.status(400).json({
                    message: "Directory is not created successfully"
                })
            }
            return res.status(201).json(directory)
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
            const isDeleted = await service.deleteDirectoryById(Number(id));
            if (isDeleted) {
                return res.status(200).json({
                    message: "Directory is deleted successfully"
                })
            }

            return res.status(500).json({
                message: "Directory is not deleted successfully"
            })
        } catch (error) {
            if (error instanceof Error) {
                next(error)
            }
        }
    })()
}
