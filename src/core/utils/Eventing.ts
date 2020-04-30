import { EventEmitter } from "events";

export type EmitInfo = {
   source: EventEmitter,
   event: string,
   data: any
}

export function emit(info: Array<EmitInfo>): void {
   for(let ev of info) {
      ev.source.emit(ev.event, ev.data)
   }
}