import {PrismaClient} from '@prisma/client';
import {
    getDirectoryPathById,
    getFilesIdRecursively,
    getSubDirectoriesIdRecursively
} from "../utils/tree";
import fs from "fs";
import path from "path";
import {TDirRef} from "../types/items";
import {TError} from "../types/error";

const prisma = new PrismaClient();

/**
 * Get directory details by id
 * @param id
 */
export const getItemsById = async (id: number) => {
    const items = await prisma.directory.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            name: true,
            User: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                }
            },
            ParentDir: true,
            createdAt: true,
            updatedAt: true,
            File: {
                select: {
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    name: true,
                    userId: true,
                    directoryId: true
                }
            },
            Directory: true
        }
    })
    if (items === null) {
        return {errorMessage: "no such directory"} as TError
    }
    return items;
}

/**
 * Get directory details by route
 * @param route
 */
export const getItemsByRoute = async (route: string) => {
    try {
        if (fs.existsSync(path.resolve(route, '__ref__'))) {

            // get the directory id from __ref__ file
            const {id} = JSON.parse(await fs.promises.readFile(path.resolve(route, '__ref__'), 'utf-8')) as TDirRef;
            return getItemsById(id);
        }
        return {errorMessage: "no such directory"} as TError
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message)
        }
    }
}

/**
 * Delete directory with its all subdirectories and files
 * @param id
 */
export const deleteDirectoryById = async (id: number) => {
    try {
        // deleting directory path
        const directoryPath = await getDirectoryPathById(id);

        // get files and directories id
        const filesId = await getFilesIdRecursively(id);
        const dirsId = [id, ...await getSubDirectoriesIdRecursively(id)];

        // delete files reference from database
        await prisma.file.deleteMany({
            where: {
                id: {
                    in: filesId
                }
            }
        })
        // delete directories reference from database
        await prisma.directory.deleteMany({
            where: {
                id: {
                    in: dirsId
                }
            }
        });

        // delete files and directories from file system
        await fs.promises.rm(directoryPath, {
            recursive: true,
            force: true
        })

        return true
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message)
        }
    }
}
