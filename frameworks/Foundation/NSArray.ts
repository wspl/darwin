import { CType, NativeType, NativeValue, StructCreator, StructDeclareBase, StructOf, TypeMap } from "jitffi";
import { toArg } from "../../lib/id";
import { alloc, getClass, msgSend } from "../../lib/objc";
import { NSObject } from "./NSObject";
import './_load'

export class NSArray<Item> extends NSObject {
  constructor(id: Buffer, public _type: NativeType) {
    super(id)
  }
  static new<T extends NativeType>(type: T) {
    return new NSArray<NativeValue<T>>(msgSend(alloc('NSArray'), 'init', CType.ptr), type)
  }
  arrayByAddingObject(item: Item) {
    msgSend(this._id, { arrayByAddingObject: { type: this._type as any, value: toArg(item) } }, CType.ptr)
  }
 }