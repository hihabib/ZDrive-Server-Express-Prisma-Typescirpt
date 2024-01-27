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
exports.login = exports.saveUser = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const constants_1 = require("../app/constants");
const fs = __importStar(require("fs"));
const jwt = __importStar(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
/**
 * Create new user
 * @param name
 * @param username
 * @param email
 * @param password
 */
const saveUser = (name, username, email, password) => __awaiter(void 0, void 0, void 0, function* () {
    // hash password with bcrypt
    const hashed = yield bcrypt_1.default.hash(password, constants_1.BCRYPT_SALT_ROUNDS);
    // create user and return
    return prisma.user.create({
        data: {
            name,
            username,
            email,
            password: hashed
        },
        select: {
            id: true,
            name: true,
            username: true,
            email: true,
        }
    });
});
exports.saveUser = saveUser;
/**
 * Let the user login
 * @param username
 * @param password
 */
const login = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.findUnique({
        where: {
            username
        },
        select: {
            id: true,
            username: true,
            name: true,
            email: true,
            password: true
        }
    });
    // stop if no user found with corresponding username
    if (user === null) {
        return { error: "no user found" };
    }
    // check password
    const isMatched = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatched) {
        return { error: "no user found" };
    }
    // delete password before sending
    const responseUser = user;
    delete responseUser.password;
    const privateKey = fs.readFileSync('private.key');
    return { token: jwt.sign(responseUser, privateKey, { algorithm: 'RS256' }) };
});
exports.login = login;
