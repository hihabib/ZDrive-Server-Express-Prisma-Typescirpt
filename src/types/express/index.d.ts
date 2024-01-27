import {TUser} from "../user";

declare global {
    namespace Express {
        interface Request {
            user?: TUser;
        }
    }
}


