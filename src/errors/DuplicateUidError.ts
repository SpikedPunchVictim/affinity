export class DuplicateUidError extends Error {
   constructor(uid: string, message: string="") {
      super(`Duplicate Uid encountered (${uid}). ${message}`)
   }
}