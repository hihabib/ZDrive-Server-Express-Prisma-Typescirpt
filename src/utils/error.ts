import {TError} from "../types/error";

export const isError = (item: any | TError): item is TError => {
    return 'errorMessage' in item
}

