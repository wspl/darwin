import { CType } from "jitffi"
import { getClass, msgSend } from "../../lib/objc"
import { NSObject } from "../Foundation/NSObject"

export class NSRunningApplication extends NSObject {
  static get currentApplication() { return new NSRunningApplication(msgSend(getClass('NSRunningApplication'), 'currentApplication', CType.ptr)) }

  activateWithOptions(options: NSApplicationActivationOptions) { return msgSend(this._id, { activateWithOptions: { type: CType.u64, value: options } }, CType.i8) }
}

export const NSApplicationActivationPolicy = {
  regular: 0n,
  accessory: 1n,
  prohibited: 2n,
} as const
export type NSApplicationActivationPolicy = (typeof NSApplicationActivationPolicy)[keyof typeof NSApplicationActivationPolicy]

export const NSApplicationActivationOptions = {
  allWindows: 1n,
  ignoringOtherApps: 2n,
} as const
export type NSApplicationActivationOptions = (typeof NSApplicationActivationOptions)[keyof typeof NSApplicationActivationOptions]