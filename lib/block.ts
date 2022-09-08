import { createCallbackCreator, CType, defineStruct, getSymbol, NativeType, Struct, StructOf } from "jitffi"

const _NSConcreteStackBlock = getSymbol('/usr/lib/libSystem.B.dylib', '_NSConcreteStackBlock')

const BlockDescriptor = defineStruct({
  reversed: CType.u64,
  size: CType.u64,
  copyHelper: CType.ptr,
  disposeHelper: CType.ptr
})

const Block = defineStruct({
  isa: CType.ptr,
  flags: CType.i32,
  reversed: CType.i32,
  invoke: CType.ptr,
  descriptor: CType.ptr
})

const BlockContextDispose = createCallbackCreator({
  name: 'BlockContextDispose',
  arguments: [CType.ptr],
  return: CType.void
})

const BlockContextCopy = createCallbackCreator({
  name: 'BlockContextCopy',
  arguments: [CType.ptr, CType.ptr],
  return: CType.void
})

const blockContextDispose = BlockContextDispose.create((block: Buffer) => {
  console.log('dispose block', block)
})

const blockContextCopy = BlockContextCopy.create((dst: Buffer, src: Buffer) => {
  console.log('copy block', dst, src)
})

// TODO: a mechanism is needed for block to be released along with function
const blockMap = new WeakMap<Function, StructOf<typeof Block>>()
export function createBlock(define: { return: NativeType, arguments: NativeType[], callback: (...args: any[]) => any }) {
  let block = blockMap.get(define.callback)

  if (!block) {
    const blockCallback = createCallbackCreator({
      name: 'BlockCallback',
      arguments: define.arguments,
      return: define.return
    }).create((self: Buffer, ...args: any[]) => {
      return define.callback(...args)
    })
  
    block = new Block({
      isa: _NSConcreteStackBlock,
      flags: 1 << 25,
      reversed: 0,
      invoke: blockCallback,
      descriptor: new BlockDescriptor({
        reversed: 0n,
        size: BigInt(Block.size),
        copyHelper: blockContextCopy,
        disposeHelper: blockContextDispose
      }).pointer()
    })
    blockMap.set(define.callback, block)
  }

  return block.pointer()
}