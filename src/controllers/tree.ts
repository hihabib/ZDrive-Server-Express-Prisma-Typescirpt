import {Request, Response} from "express";
import path from "path";
import {getItemsFromFs} from "../utils/fileSystem";

export const getItems = (req: Request, res: Response) => {
    if (req.user === undefined) {
        throw new Error("Unauthorized")
    }
    let route = req.params[0] as (string | undefined);
    if (route === undefined) {
        route = path.resolve('uploads', 'userData', req.user.username)
    } else {
        route = path.resolve('uploads', 'userData', req.user.username, path.join(...route.split("/")))
    }

    (async () => {
        const items = await getItemsFromFs(route);
        if (items === undefined) {
            throw new Error("Items not found")
        }
        res.status(200).json(items)
    })()
}

