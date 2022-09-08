import { Id } from "../../lib/id";
import './_load'

export class NSObject implements Id {
  constructor(public _id: Buffer) {}
}