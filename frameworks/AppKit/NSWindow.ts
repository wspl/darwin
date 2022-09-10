import { NSObject } from "../Foundation/NSObject";
import { CType, nullptr, StructOf } from "jitffi";
import { msgSend } from "../../lib/objc";
import { NSString } from "../Foundation/NSString";
import { Id } from "../../lib/id";
import './_load'
import { CGRect } from "../CoreGraphics/CGGeometry";

export class NSWindow extends NSObject {
  static alloc() { return new NSWindow('NSWindow') }

  initWithContentRect_styleMask_backing_defer(contentRect: StructOf<typeof CGRect>, style: NSWindowStyleMask, backingStoreType: NSBackingStoreType, flag: number) { return this._instancetype(msgSend(this._id, { initWithContentRect: { type: CGRect, value: contentRect }, styleMask: { type: CType.u64, value: style }, backing: { type: CType.u64, value: backingStoreType }, defer: { type: CType.i8, value: flag } }, CType.ptr)) }
  center() { return msgSend(this._id, 'center', CType.void) }
  makeKeyAndOrderFront(sender: Id) { return msgSend(this._id, { makeKeyAndOrderFront: { type: CType.ptr, value: sender._id } }, CType.void) }

  get title() { return msgSend(this._id, 'getTitle', CType.ptr) }
  set title(v: NSString) { msgSend(this._id, { setTitle: { type: CType.ptr, value: v._id } }, CType.ptr) }
}

export const NSWindowStyleMask = {
  borderless: 0n,
  titled: 1n,
  closable: 2n,
  miniaturizable: 4n,
  resizable: 8n,
  texturedBackground: 256n,
  unifiedTitleAndToolbar: 4096n,
  fullScreen: 16384n,
  fullSizeContentView: 32768n,
  utilityWindow: 16n,
  docModalWindow: 64n,
  nonactivatingPanel: 128n,
  hudWindow: 8192n,
} as const
export type NSWindowStyleMask = (typeof NSWindowStyleMask)[keyof typeof NSWindowStyleMask]

export const NSBackingStoreType = {
  retained: 0n,
  nonretained: 1n,
  buffered: 2n,
} as const
export type NSBackingStoreType = (typeof NSBackingStoreType)[keyof typeof NSBackingStoreType]