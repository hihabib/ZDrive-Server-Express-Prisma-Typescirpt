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
exports.getFilesIdRecursively = exports.getFilesId = exports.getSubDirectoriesIdRecursively = exports.getDirectoryPathById = exports.createDirectory = exports.getDirectoryIdByPath = exports.getItemsFromFs = exports.getRouteFs = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Get route of user uploaded data from file system by express Request.
 * Authentication is required
 * @param req
 */
const getRouteFs = (req) => {
    if (req.user === undefined) {
        throw new Error("Unauthorized");
    }
    let route = req.params[0];
    if (route === undefined) {
        route = path_1.default.resolve('uploads', 'userData', req.user.username);
    }
    else {
        route = path_1.default.resolve('uploads', 'userData', req.user.username, path_1.default.join(...route.split("/")));
    }
    return route;
};
exports.getRouteFs = getRouteFs;
/**
 * get file and directory list by directory path
 * @param directoryPath
 */
const getItemsFromFs = (directoryPath) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const items = yield fs_1.default.promises.readdir(directoryPath);
        const structuredItems = {
            files: [],
            directories: []
        };
        for (const item of items) {
            try {
                const itemPath = path_1.default.join(directoryPath, item);
                const stats = yield fs_1.default.promises.stat(itemPath);
                if (stats.isFile()) {
                    if (item !== "__ref__") {
                        (_a = structuredItems.files) === null || _a === void 0 ? void 0 : _a.push(item);
                    }
                }
                else if (stats.isDirectory()) {
                    (_b = structuredItems.directories) === null || _b === void 0 ? void 0 : _b.push(item);
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error('Error reading directory:', error);
                    return;
                }
            }
        }
        return structuredItems;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
    }
});
exports.getItemsFromFs = getItemsFromFs;
/**
 * Get id by directory path
 * if dirPath not available, this function will return -1
 * @param dirPath
 */
const getDirectoryIdByPath = (dirPath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!fs_1.default.existsSync(dirPath)) {
            return -1;
        }
        const { id } = JSON.parse(yield fs_1.default.promises.readFile(path_1.default.resolve(dirPath, '__ref__'), 'utf-8'));
        return id;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
    }
});
exports.getDirectoryIdByPath = getDirectoryIdByPath;
/**
 * create directory in both file system with reference in database.
 * recursive works when hasParent is false
 * @param newDirPath
 * @param username
 * @param hasParent
 */
const createDirectory = (newDirPath, username, hasParent = true) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // parent dir connector for making relation in db
        let parentConnector = {};
        if (hasParent) {
            const parentDir = path_1.default.dirname(newDirPath);
            const parentDirId = yield (0, exports.getDirectoryIdByPath)(parentDir);
            if (parentDirId === -1) { // parent directory doesn't exists/
                return false;
            }
            parentConnector = {
                ParentDir: {
                    connect: {
                        id: parentDirId
                    }
                }
            };
        }
        // create directory in file system
        yield fs_1.default.promises.mkdir(newDirPath, { recursive: true });
        // create directory ref in DB
        const directory = yield prisma.directory.create({
            data: Object.assign({ name: path_1.default.basename(newDirPath), User: {
                    connect: {
                        username
                    }
                } }, parentConnector)
        });
        // create directory ref in file system in '__ref__' file
        yield fs_1.default.promises.appendFile(path_1.default.resolve(newDirPath, '__ref__'), JSON.stringify({ id: directory.id }));
        return true;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
    }
});
exports.createDirectory = createDirectory;
/**
 * Get sub or inner directories id
 * @param id
 */
const getSubDirectoriesById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const directories = yield prisma.directory.findUnique({
        where: {
            id
        },
        select: {
            Directory: true
        }
    });
    if (directories === null) {
        return [];
    }
    return directories.Directory;
});
/**
 * Get file system directory path by directory id
 * @param id
 */
const getDirectoryPathById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const directories = [];
    yield (function getDirName(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentDirectory = yield prisma.directory.findUnique({
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
                directories.push(currentDirectory.name);
                if (currentDirectory.parentDirId !== null) {
                    yield getDirName(currentDirectory.parentDirId);
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(error.message);
                }
            }
        });
    })(id);
    return path_1.default.resolve("uploads", "userData", ...directories.reverse());
});
exports.getDirectoryPathById = getDirectoryPathById;
/**
 * Get all ids of all subdirectories / inner directories recursively by id
 * @param id
 */
const getSubDirectoriesIdRecursively = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const ids = [];
    yield (function getIds(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const directories = yield getSubDirectoriesById(id);
            for (const directory of directories) {
                ids.push(directory.id);
                yield getIds(directory.id);
            }
        });
    })(id);
    return ids;
});
exports.getSubDirectoriesIdRecursively = getSubDirectoriesIdRecursively;
/**
 * Get all files id by directory id
 * @param dirId
 */
const getFilesId = (dirId) => __awaiter(void 0, void 0, void 0, function* () {
    const files = yield prisma.directory.findUnique({
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
    const filesId = [];
    for (const file of files.File) {
        filesId.push(file.id);
    }
    return filesId;
});
exports.getFilesId = getFilesId;
const getFilesIdRecursively = (dirId) => __awaiter(void 0, void 0, void 0, function* () {
    const allFilesId = yield (0, exports.getFilesId)(dirId);
    const allDirsId = yield (0, exports.getSubDirectoriesIdRecursively)(dirId);
    // collect all files id recursively
    for (const id of allDirsId) {
        const filesId = yield (0, exports.getFilesId)(id);
        allFilesId.push(...filesId);
    }
    return allFilesId;
});
exports.getFilesIdRecursively = getFilesIdRecursively;
