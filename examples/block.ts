import { createCallbackCreator, cstr, CType, defineStruct, getSymbol, loadModule } from "jitffi";
import { createBlock } from "../lib/block";
import { getClass, msgSend } from "../lib/objc";

loadModule('/System/Library/Frameworks/AppKit.framework/AppKit')

const NSMutableArray = getClass('NSMutableArray')

const array = msgSend(msgSend(NSMutableArray, 'alloc', CType.ptr), 'init', CType.ptr)
msgSend(array, { addObject: { type: CType.i32, value: 12345 } }, CType.void)
msgSend(array, { addObject: { type: CType.i32, value: 54321 } }, CType.void)
msgSend(array, { addObject: { type: CType.i32, value: 54321 } }, CType.void)

const el0 = msgSend(array, { objectAtIndex: { type: CType.u64, value: 0n } }, CType.i32)
console.log(el0)

msgSend(array, {
  enumerateObjectsUsingBlock: {
    type: CType.ptr, value: createBlock({
      return: CType.void,
      arguments: [CType.i32, CType.u64, CType.i32],
      callback: (value, index, stop) => {
        console.log('forEach', value, index, stop)
      }
    })
  }
}, CType.void)
