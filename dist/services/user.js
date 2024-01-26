"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUser = void 0;
const edge_1 = require("@prisma/client/edge");
const prisma = new edge_1.PrismaClient();
const saveUser = (name, username, email, password) => {
    return prisma.user.create({
        data: {
            name,
            username,
            email,
            password
        }
    });
};
exports.saveUser = saveUser;
