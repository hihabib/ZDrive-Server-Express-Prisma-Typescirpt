"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDirectoryById = exports.getItemsByRoute = exports.getItemsById = void 0;
const client_1 = require("@prisma/client");
const tree_1 = require("../utils/tree");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
/**
 * Get directory details by id
 * @param id
 */
const getItemsById = (id) => {
    return prisma.directory.findUnique({
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
            File: true,
            Directory: true
        }
    });
};
exports.getItemsById = getItemsById;
/**
 * Get directory details by route
 * @param route
 */
const getItemsByRoute = (route) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get the directory id from __ref__ file
        const { id } = JSON.parse(yield fs_1.default.promises.readFile(path_1.default.resolve(route, '__ref__'), 'utf-8'));
        return (0, exports.getItemsById)(id);
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
    }
});
exports.getItemsByRoute = getItemsByRoute;
/**
 * Delete directory with its all subdirectories and files
 * @param id
 */
const deleteDirectoryById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // deleting directory path
        const directoryPath = yield (0, tree_1.getDirectoryPathById)(id);
        // get files and directories id
        const filesId = yield (0, tree_1.getFilesIdRecursively)(id);
        const dirsId = [id, ...yield (0, tree_1.getSubDirectoriesIdRecursively)(id)];
        // delete files reference from database
        yield prisma.file.deleteMany({
            where: {
                id: {
                    in: filesId
                }
            }
        });
        // delete directories reference from database
        yield prisma.directory.deleteMany({
            where: {
                id: {
                    in: dirsId
                }
            }
        });
        // delete files and directories from file system
        yield fs_1.default.promises.rm(directoryPath, { recursive: true, force: true });
        return true;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
    }
});
exports.deleteDirectoryById = deleteDirectoryById;
