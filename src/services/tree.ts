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
        await fs.promises.rm(directoryPath, {recursive: true, force: true})

        return true
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message)
        }
    }
}
