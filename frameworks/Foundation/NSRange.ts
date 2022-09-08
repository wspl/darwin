import { CType, defineStruct } from "jitffi";
import './_load'

export const NSRange = defineStruct({
  location: CType.u64,
  length: CType.u64
})

export function NSMakeRange(loc: bigint, len: bigint) {
  return new NSRange({ location: loc, length: len })
}
