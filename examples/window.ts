import { NSApplication } from "../frameworks/AppKit/NSApplication";
import { NSApplicationActivateIgnoringOtherApps, NSApplicationActivationPolicyRegular, NSRunningApplication } from "../frameworks/AppKit/NSRunningApplication";
import { NSBackingStoreBuffered, NSWindow, NSWindowStyleMaskTitled } from "../frameworks/AppKit/NSWindow";
import { NSMakeRect, NSRect } from "../frameworks/Foundation/NSGeometry";
import { NSString } from "../frameworks/Foundation/NSString";

const app = NSApplication.sharedApplication()
app.setActivationPolicy(NSApplicationActivationPolicyRegular)

const window = NSWindow.new({
  initWithContentRect: NSMakeRect(0, 0, 200, 200),
  styleMask: NSWindowStyleMaskTitled,
  backing: NSBackingStoreBuffered,
  defer: false
})
window.center()
window.title = NSString.from('Hello World')
window.makeKeyAndOrderFront()

const currentApp = NSRunningApplication.currentApplication()
currentApp.activateWithOptions(NSApplicationActivateIgnoringOtherApps)

app.run()