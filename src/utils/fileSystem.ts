import fs from "fs";
import {TItems} from "../types/items";
import path from "path";
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient();

/**
 * get file and directory list by directory path
 * @param directoryPath
 */
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
                    if (item !== "__ref__") {
                        structuredItems.files?.push(item)
                    }
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

/**
 * create directory in both file system with reference in database
 * @param newDirPath
 * @param username
 */
export const createDirectory = async (newDirPath: string, username: string) => {
    try {
        // create directory in file system
        await fs.promises.mkdir(newDirPath, {recursive: true})

        // create directory ref in DB
        const directory = await prisma.directory.create({
            data: {
                name: path.basename(newDirPath),
                User: {
                    connect: {
                        username
                    }
                }
            }
        })

        // create directory ref in file system in '__ref__' file
        await fs.promises.appendFile(path.resolve(newDirPath, '__ref__'), JSON.stringify({id: directory.id}))

    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
    }
}
