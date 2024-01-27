import fs from "fs";
import {TItems} from "../types/items";
import path from "path";

export const getItemsFromFs = async (directoryPath: string) => {
    try {
        const items = await fs.promises.readdir(directoryPath);
        const structuredItems: TItems = {
            files: [],
            directories: []
        }
        for (const item of items) {
            try {
                const itemPath = path.join(directoryPath, item);

                const stats = await fs.promises.stat(itemPath);
                if (stats.isFile()) {
                    structuredItems.files?.push(item)
                } else if (stats.isDirectory()) {
                    structuredItems.directories?.push(item)
                }
            } catch (error) {
                if (error instanceof Error) {
                    console.error('Error reading directory:', error);
                    return;
                }
            }
        }
        return structuredItems;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error reading directory:', error);
            return;
        }
    }
}
