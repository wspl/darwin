import { NSObject } from "../Foundation/NSObject";
import { NSRect } from "../Foundation/NSGeometry";
import { CType, nullptr, StructOf } from "jitffi";
import { alloc, getClass, msgSend } from "../../lib/objc";
import { NSString } from "../Foundation/NSString";
import { Id } from "../../lib/id";
import './_load'

export class NSWindow extends NSObject {
  static new({ initWithContentRect, styleMask, backing, defer }: {
    initWithContentRect: StructOf<typeof NSRect>,
    styleMask: number,
    backing: number,
    defer: boolean
  }): NSWindow {
    return new NSWindow(msgSend(alloc('NSWindow'), {
      initWithContentRect: { type: NSRect, value: initWithContentRect },
      styleMask: { type: CType.u64, value: BigInt(styleMask) },
      backing: { type: CType.u64, value: BigInt(backing) },
      defer: { type: CType.i8, value: defer ? 1 : 0 }
    }, CType.ptr))
  }

  center() {
    msgSend(this._id, 'center', CType.void)
  }

  get title(): NSString {
    return new NSString(msgSend(this._id, 'getTitle', CType.ptr))
  }

  set title(title: NSString) {
    msgSend(this._id, { setTitle: { type: CType.ptr, value: title._id } }, CType.void)
  }

  makeKeyAndOrderFront(sender?: Id) {
    msgSend(this._id, { makeKeyAndOrderFront: { type: CType.ptr, value: sender?._id ?? nullptr } }, CType.void)
  }
}

export const NSWindowStyleMaskBorderless = 0
export const NSWindowStyleMaskTitled = 1 << 0
export const NSWindowStyleMaskClosable = 1 << 1
export const NSWindowStyleMaskMiniaturizable = 1 << 2
export const NSWindowStyleMaskResizable	= 1 << 3
export const NSWindowStyleMaskUnifiedTitleAndToolbar = 1 << 12
export const NSWindowStyleMaskFullScreen = 1 << 14
export const NSWindowStyleMaskFullSizeContentView = 1 << 15
export const NSWindowStyleMaskUtilityWindow	= 1 << 4
export const NSWindowStyleMaskDocModalWindow = 1 << 6
export const NSWindowStyleMaskNonactivatingPanel = 1 << 7
export const NSWindowStyleMaskHUDWindow = 1 << 13

export const NSBackingStoreRetained = 0
export const NSBackingStoreNonretained = 1
export const NSBackingStoreBuffered = 2