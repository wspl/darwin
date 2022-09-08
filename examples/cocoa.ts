import { cstr, CType, loadModule } from "jitffi";
import { getClass, msgSend } from "../lib/objc";

loadModule('/System/Library/Frameworks/AppKit.framework/AppKit')

const NSAlert = getClass('NSAlert')
const NSString = getClass('NSString')

const alert = msgSend(msgSend(NSAlert, 'alloc', CType.ptr), 'init', CType.ptr)
const text = msgSend(NSString, { stringWithUTF8String: { type: CType.ptr, value: cstr('Hello World') }}, CType.ptr)
msgSend(alert, { setMessageText: { type: CType.ptr, value: text } }, CType.void)
msgSend(alert, 'runModal', CType.void)
