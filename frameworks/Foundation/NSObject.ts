import { Id } from "../../lib/id";
import { alloc } from "../../lib/objc";
import './_load'

export class NSObject implements Id {
  _id: Buffer

  constructor(id: Buffer)
  constructor(className: string)
  constructor(arg0: Buffer | string) {
    if (typeof arg0 === 'string') {
      this._id = alloc(arg0)
    } else {
      this._id = arg0
    }
  }

  _instancetype(id: Buffer): this {
    if (id.compare(this._id)) {
      return this
    } else {
      const ctor = Object.getPrototypeOf(this).constructor
      return new ctor(id)
    }
  }
}