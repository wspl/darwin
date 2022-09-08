import { nullptr } from "jitffi"

export interface Id {
    _id: Buffer
}

export const nullId = { _id: nullptr }

export function toArg(item: any): any {
    if (typeof item === 'object' && item._id) {
        return item._id
    } else {
        return item
    }
}