import {Request} from "express";
import fs from "fs";
import {TDirRef, TItems} from "../types/items";
import path from "path";
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient();

/**
 * Get route of user uploaded data from file system by express Request.
 * Authentication is required
 * @param req
 */
export const getRouteFs = (req: Request): string => {
    if (req.user === undefined) {
        throw new Error("Unauthorized")
    }
    let route = req.params[0] as (string | undefined);
    if (route === undefined) {
        route = path.resolve('uploads', 'userData', req.user.username)
    } else {
        route = path.resolve('uploads', 'userData', req.user.username, path.join(...route.split("/")))
    }
    return route;
}

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
            throw new Error(error.message)
        }
    }
}

/**
 * Get id by directory path
 * if dirPath not available, this function will return -1
 * @param dirPath
 */
export const getDirectoryIdByPath = async (dirPath: string) => {
    try {
        if (!fs.existsSync(dirPath)) {
            return -1
        }
        const {id} = JSON.parse(await fs.promises.readFile(path.resolve(dirPath, '__ref__'), 'utf-8')) as TDirRef;

        return id
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message)
        }
    }
}
/**
 * create directory in both file system with reference in database.
 * recursive works when hasParent is false
 * @param newDirPath
 * @param username
 * @param hasParent
 */
export const createDirectory = async (newDirPath: string, username: string, hasParent: boolean = true) => {
    try {

        // parent dir connector for making relation in db
        let parentConnector: {
            ParentDir: { connect: { id: number } }
        } | {} = {}
        if (hasParent) {
            const parentDir = path.dirname(newDirPath);
            const parentDirId = await getDirectoryIdByPath(parentDir);
            if (parentDirId === -1) { // parent directory doesn't exists/
                return false;
            }
            parentConnector = {
                ParentDir: {
                    connect: {
                        id: parentDirId
                    }
                }
            }
        }

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
                },
                ...parentConnector
            }
        })

        // create directory ref in file system in '__ref__' file
        await fs.promises.appendFile(path.resolve(newDirPath, '__ref__'), JSON.stringify({id: directory.id}))
        return true
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
    }
}

/**
 * Get sub or inner directories id
 * @param id
 */
const getSubDirectoriesById = async (id: number) => {
    const directories = await prisma.directory.findUnique({
        where: {
            id
        },
        select: {
            Directory: true
        }
    })
    if (directories === null) {
        return [];
    }
    return directories.Directory
}
/**
 * Get file system directory path by directory id
 * @param id
 */
export const getDirectoryPathById = async (id: number) => {
    const directories: string[] = [];
    await (async function getDirName(id: number) {
        try {
            const currentDirectory = await prisma.directory.findUnique({
                where: {
                    id,
                },
                include: {
                    Directory: true
                }
            });
            if (currentDirectory === null) {
                return;
            }
            directories.push(currentDirectory.name)
            if (currentDirectory.parentDirId !== null) {
                await getDirName(currentDirectory.parentDirId);
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
        }
    })(id);

    return path.resolve("uploads", "userData", ...directories.reverse())
}

/**
 * Get all ids of all subdirectories / inner directories recursively by id
 * @param id
 */
export const getSubDirectoriesIdRecursively = async (id: number) => {
    const ids: number[] = [];
    await (async function getIds(id: number) {
        const directories = await getSubDirectoriesById(id);
        for (const directory of directories) {
            ids.push(directory.id);
            await getIds(directory.id)
        }
    })(id);
    return ids
}

/**
 * Get all files id by directory id
 * @param dirId
 */
export const getFilesId = async (dirId: number) => {
    const files = await prisma.directory.findUnique({
        where: {
            id: dirId
        },
        select: {
            File: true
        }
    });
    if (files === null) {
        return [];
    }

    const filesId: number[] = []
    for (const file of files.File) {
        filesId.push(file.id)
    }
    return filesId
}

export const getFilesIdRecursively = async (dirId: number) => {
    const allFilesId = await getFilesId(dirId);
    const allDirsId = await getSubDirectoriesIdRecursively(dirId);

    // collect all files id recursively
    for (const id of allDirsId) {
        const filesId = await getFilesId(id);
        allFilesId.push(...filesId)
    }
    return allFilesId
}

