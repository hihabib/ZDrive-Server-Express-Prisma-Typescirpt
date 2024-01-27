import {Request, Response} from "express";
import {createDirectory, getItemsFromFs, getRouteFs} from "../utils/fileSystem";
import fs from "fs";

/**
 * Controller function to get the list of files and directory
 * @param req
 * @param res
 */
export const getItems = (req: Request, res: Response) => {
    const route = getRouteFs(req);

    (async () => {
        const items = await getItemsFromFs(route);
        if (items === undefined) {
            throw new Error("Items not found")
        }
        res.status(200).json(items)
    })();

}

export const createDirectoryByUser = (req: Request, res: Response) => {
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
            await createDirectory(route, (req.user!).username)
            return res.status(201).json({
                message: "Directory is created successfully"
            })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
        }
    })()

}
