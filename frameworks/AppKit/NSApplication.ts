import { CType } from "jitffi";
import { alloc, getClass, msgSend } from "../../lib/objc";
import { NSObject } from "../Foundation/NSObject";
import { NSApplicationActivationPolicy } from "./NSRunningApplication";
import './_load'

export class NSApplication extends NSObject {
  static get sharedApplication() { return new NSApplication(msgSend(getClass('NSApplication'), 'sharedApplication', CType.ptr)) }

  run() { return msgSend(this._id, 'run', CType.void) }

  activateIgnoringOtherApps(flag: number) { return msgSend(this._id, { activateIgnoringOtherApps: { type: CType.i8, value: flag } }, CType.void) }

  setActivationPolicy(activationPolicy: NSApplicationActivationPolicy) { return msgSend(this._id, { setActivationPolicy: { type: CType.i64, value: activationPolicy } }, CType.i8) }
}
