import {PrismaClient} from '@prisma/client'
import bcrypt from "bcryptjs";
import {BCRYPT_SALT_ROUNDS} from "../app/constants";
import * as fs from "fs";
import * as jwt from 'jsonwebtoken'
import {TUser} from "../types/user";
import path from "path";
import {createDirectory} from "../utils/tree";

const prisma = new PrismaClient()

/**
 * Create new user
 * @param name
 * @param username
 * @param email
 * @param password
 */
export const saveUser = async (name: string, username: string, email: string, password: string) => {

    try {
        // hash password with bcrypt
        const salt = bcrypt.genSaltSync(BCRYPT_SALT_ROUNDS);
        const hashed = bcrypt.hashSync(password, salt);

        // create user
        const user = await prisma.user.create({
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
        })

        // create new directory for new user
        const newDirPath = path.resolve('uploads', 'userData', username)
        await createDirectory(newDirPath, username, false)
        return user
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message)
        }
    }
}

/**
 * Let the user login
 * @param username
 * @param password
 */
export const login = async (username: string, password: string): Promise<{
    token: string
} | { error: string } | undefined> => {
    try {
        const user = await prisma.user.findUnique({
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
        })

        // stop if no user found with corresponding username
        if (user === null) {
            return {error: "no user found"};
        }

        // check password
        const isMatched = bcrypt.compareSync(password, user.password)
        if (!isMatched) {
            return {error: "no user found"}
        }
        // delete password before sending
        const responseUser = user as TUser
        delete responseUser.password;

        const privateKey = fs.readFileSync(path.resolve('private.key'));
        return {token: jwt.sign(responseUser, privateKey, {algorithm: 'RS256'})};
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message)
        }
    }
}
