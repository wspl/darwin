import { cstr, CType } from "jitffi";
import { alloc, getClass, msgSend } from "../../lib/objc";
import { NSObject } from "./NSObject";
import './_load'

export class NSString extends NSObject {
  static from(s: string) {
    return new NSString(msgSend(getClass('NSString'), {
      stringWithUTF8String: { type: CType.ptr, value: cstr('Hello World') }
    }, CType.ptr))
  }
}