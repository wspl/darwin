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

export function CGMakeRect(x: number, y: number, w: number, h: number) {
  return new CGRect({
    origin: new CGPoint({
      x,
      y
    }),
    size: new CGSize({
      width: w,
      height: h
    })
  })
}
