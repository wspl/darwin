import { CType } from "jitffi";
import { alloc, getClass, msgSend } from "../../lib/objc";
import { NSObject } from "../Foundation/NSObject";
import './_load'

export class NSApplication extends NSObject {
  static sharedApplication() {
    return new NSApplication(msgSend(getClass('NSApplication'), 'sharedApplication', CType.ptr))
  }

  run() {
    msgSend(this._id, 'run', CType.void)
  }

  activateIgnoringOtherApps(flag: boolean) {
    return Boolean(msgSend(this._id, {
      activateIgnoringOtherApps: { type: CType.i8, value: flag ? 1 : 0 }
    }, CType.i8))
  }

  setActivationPolicy(activationPolicy: number) {
    return Boolean(msgSend(this._id, {
      setActivationPolicy: { type: CType.i64, value: BigInt(activationPolicy) }
    }, CType.i8))
  }
}
