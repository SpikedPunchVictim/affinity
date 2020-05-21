export class IndexOutOfRangeError extends Error {
   constructor(value: number, msg: string = "") {
      super(`${value} is out of index range. ${msg}`)
   }
}