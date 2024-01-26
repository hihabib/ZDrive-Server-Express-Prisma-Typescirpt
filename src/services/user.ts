import {PrismaClient} from '@prisma/client'
import bcrypt from "bcrypt";
import {BCRYPT_SALT_ROUNDS} from "../app/constants";
import * as fs from "fs";
import * as jwt from 'jsonwebtoken'
import {TUser} from "../types/user";

const prisma = new PrismaClient()

/**
 * Create new user
 * @param name
 * @param username
 * @param email
 * @param password
 */
export const saveUser = async (name: string, username: string, email: string, password: string) => {
    // hash password with bcrypt
    const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

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
    })

}

/**
 * Let the user login
 * @param username
 * @param password
 */
export const login = async (username: string, password: string): Promise<{
    token: string
} | { error: string }> => {
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
    const isMatched = await bcrypt.compare(password, user.password)
    if (!isMatched) {
        return {error: "no user found"}
    }
    // delete password before sending
    const responseUser = user as TUser
    delete responseUser.password;

    const privateKey = fs.readFileSync('private.key');
    return {token: jwt.sign(responseUser, privateKey, {algorithm: 'RS256'})};
}