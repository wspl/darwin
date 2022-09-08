import { CType } from "jitffi"
import { getClass, msgSend } from "../../lib/objc"
import { NSObject } from "../Foundation/NSObject"

export class NSRunningApplication extends NSObject {
  static currentApplication() {
    return new NSRunningApplication(msgSend(getClass('NSRunningApplication'), 'currentApplication', CType.ptr))
  }

  activateWithOptions(options: number) {
    return Boolean(msgSend(this._id, { activateWithOptions: { type: CType.u64, value: BigInt(options) } }, CType.i8))
  }
}

export const NSApplicationActivationPolicyRegular = 0
export const NSApplicationActivationPolicyAccessory = 1
export const NSApplicationActivationPolicyProhibited = 2

export const NSApplicationActivateAllWindows = 1 << 0
export const NSApplicationActivateIgnoringOtherApps = 1 << 1