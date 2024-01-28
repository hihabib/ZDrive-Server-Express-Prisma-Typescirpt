"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.deleteDirectoryById = exports.createDirectoryByUser = exports.getItems = void 0;
const tree_1 = require("../utils/tree");
const fs_1 = __importDefault(require("fs"));
const service = __importStar(require("../services/tree"));
/**
 * Controller function to get the list of files and directory
 * @param req
 * @param res
 * @param next
 */
const getItems = (req, res, next) => {
    const route = (0, tree_1.getRouteFs)(req);
    (() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const items = yield service.getItemsByRoute(route);
            if (items === null) {
                return res.status(404).json("Items not found");
            }
            if (items === undefined) {
                return res.status(501).json("Something went wrong");
            }
            return res.status(200).json(items);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
        }
    }))();
};
exports.getItems = getItems;
/**
 * Create Directory by user
 * @param req
 * @param res
 * @param next
 */
const createDirectoryByUser = (req, res, next) => {
    if (req.user === undefined) {
        throw new Error("Unauthorized");
    }
    const route = (0, tree_1.getRouteFs)(req);
    (() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (fs_1.default.existsSync(route)) {
                return res.status(401).json({
                    message: "Directory already exists"
                });
            }
            // create directory here
            const isCreated = yield (0, tree_1.createDirectory)(route, (req.user).username);
            if (!isCreated) {
                return res.status(400).json({
                    message: "Directory is not created successfully"
                });
            }
            return res.status(201).json({
                message: "Directory is created successfully"
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
        }
    }))();
};
exports.createDirectoryByUser = createDirectoryByUser;
const deleteDirectoryById = (req, res, next) => {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const isDeleted = yield service.deleteDirectoryById(Number(id));
            if (isDeleted) {
                return res.status(200).json({
                    message: "Directory is deleted successfully"
                });
            }
            return res.status(500).json({
                message: "Directory is not deleted successfully"
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
        }
    }))();
};
exports.deleteDirectoryById = deleteDirectoryById;
