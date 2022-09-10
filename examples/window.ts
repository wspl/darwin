import { NSApplication } from "../frameworks/AppKit/NSApplication";
import { NSApplicationActivationOptions, NSApplicationActivationPolicy, NSRunningApplication } from "../frameworks/AppKit/NSRunningApplication";
import { NSBackingStoreType, NSWindow, NSWindowStyleMask } from "../frameworks/AppKit/NSWindow";
import { CGMakeRect } from "../frameworks/CoreGraphics/CGGeometry";
import { NSString } from "../frameworks/Foundation/NSString";
import { nullId } from "../lib/id";

const app = NSApplication.sharedApplication
app.setActivationPolicy(NSApplicationActivationPolicy.regular)

const window = NSWindow.alloc().initWithContentRect_styleMask_backing_defer(
  CGMakeRect(0, 0, 200, 200),
  NSWindowStyleMask.titled,
  NSBackingStoreType.buffered,
  0
)
window.center()
window.title = NSString.from('Hello World')
window.makeKeyAndOrderFront(nullId)

const currentApp = NSRunningApplication.currentApplication
currentApp.activateWithOptions(NSApplicationActivationOptions.ignoringOtherApps)

app.run()