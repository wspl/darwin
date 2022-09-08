import { CType, defineStruct } from "jitffi";
import './_load'

export const CGFloat = CType.f64

export const CGSize = defineStruct({
  width: CGFloat,
  height: CGFloat
})

export const CGPoint = defineStruct({
  x: CGFloat,
  y: CGFloat
})

export const CGRect = defineStruct({
  origin: CGPoint,
  size: CGSize
})

console.log(CGSize.size, CGPoint.size, CGRect.size)
