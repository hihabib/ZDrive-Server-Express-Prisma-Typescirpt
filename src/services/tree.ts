import {PrismaClient} from '@prisma/client';
import {
    getDirectoryPathById,
    getFilesIdRecursively,
    getSubDirectoriesIdRecursively
} from "../utils/tree";
import fs from "fs";

const prisma = new PrismaClient();

export const deleteDirectoryById = async (id: number) => {
    try {
        // deleting directory path
        const directoryPath = await getDirectoryPathById(id);

        // get files and directories id
        const filesId = await getFilesIdRecursively(id);
        const dirsId = [id, ...await getSubDirectoriesIdRecursively(id)];

        // delete files reference from database
        const fileDeleted = await prisma.file.deleteMany({
            where: {
                id: {
                    in: filesId
                }
            }
        })
        // delete directories reference from database
        const dirsDeleted = await prisma.directory.deleteMany({
            where: {
                id: {
                    in: dirsId
                }
            }
        });
        console.log("path:", directoryPath)
        await fs.promises.rm(directoryPath, {recursive: true, force: true})
        console.log("files", fileDeleted)
        console.log("directories", dirsDeleted)
        return true
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message)
        }
    }
}
