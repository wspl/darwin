import { createFunction, CType, NativeType, Struct, StructCreator, cstr } from 'jitffi'
import { libObjC, objc_getClass, sel_registerName } from './objc_sys'

export type TypedValue =
  { type: CType.i8 | CType.i16 | CType.i32 | CType.u8 | CType.u16 | CType.u32, value: number } |
  { type: CType.i64 | CType.u64, value: bigint } |
  { type: CType.ptr, value: Buffer } |
  { type: StructCreator<any>, value: Struct<any> }

const structCreatorIdMap = new WeakMap<StructCreator<any>, number>()
let nextSturctCreatorId = -1

function getStructCreatorId(sc: StructCreator<any>) {
  let id = structCreatorIdMap.get(sc)
  if (!id) {
    id = nextSturctCreatorId
    structCreatorIdMap.set(sc, id)
    nextSturctCreatorId--
  }
  return id
}

const msgSendFnMap = new Map<string, Function>()
export function msgSend(obj: Buffer, selectorArgs: string | Record<string, TypedValue>, retTy: NativeType) {
  const sels: string[] = []
  const values: TypedValue[] = []
  if (typeof selectorArgs === 'string') {
    sels.push(selectorArgs)
  } else {
    for (const [key, value] of Object.entries(selectorArgs)) {
      sels.push(`${key}:`)
      values.push(value)
    }
  }
  const fnKey = values.map(t => {
    if (typeof t.type === 'number') {
      return t.type
    } else {
      return getStructCreatorId(t.type)
    }
  }).join()

  let msgSendFn = msgSendFnMap.get(fnKey)
  if (!msgSendFn) {
    msgSendFn = createFunction({
      module: libObjC,
      name: 'objc_msgSend',
      return: retTy,
      arguments: [
        CType.ptr,
        CType.ptr,
        ...values.map(t => t.type)
      ]
    })
    msgSendFnMap.set(fnKey, msgSendFn)
  }
  
  return msgSendFn(obj, sel(sels.join('')), ...values.map(t => t.value))
}

const selMap = new Map<string, Buffer>()
export function sel(s: string) {
  let sel = selMap.get(s)
  if (!sel) {
    sel = sel_registerName(cstr(s))
    selMap.set(s, sel)
  }
  return sel
}

const classMap = new Map<string, Buffer>()
export function getClass(c: string) {
  let clz = classMap.get(c)
  if (!clz) {
    clz = objc_getClass(cstr(c))
    classMap.set(c, clz)
  }
  return clz
}

export function alloc(s: string) {
  return msgSend(getClass(s), 'alloc', CType.ptr)
}