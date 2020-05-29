export class ObjectDoesNotExistError extends Error {
   readonly error?: Error

   constructor(msg: string) {
      super(`Object Does Not Exist: ${msg}`)
   }
}