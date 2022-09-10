import { CType, defineStruct } from "jitffi";
import './_load'

export const _NSRange = defineStruct({
  location: CType.u64,
  length: CType.u64
})

export function NSMakeRange(loc: bigint, len: bigint) {
  return new _NSRange({ location: loc, length: len })
}
