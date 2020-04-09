export class IndexOutOfRangeError extends Error {
   constructor(value: number) {
      super(`${value} is out of index range`)
   }
}