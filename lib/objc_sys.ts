import { createFunction, CType } from "jitffi"

export const libObjC = '/usr/lib/libobjc.A.dylib'

export const sel_registerName = createFunction({
  module: libObjC,
  name: 'sel_registerName',
  arguments: [CType.ptr],
  return: CType.ptr
})

export const objc_getClass = createFunction({
  module: libObjC,
  name: 'objc_getClass',
  arguments: [CType.ptr],
  return: CType.ptr
})