export type Defer<T> = {
   promise: Promise<T>
   resolve: (...args: any[]) => any
   reject: (err?: Error) => void
}

/**
 * Creates a deferred promise object
 */
export function defer<T = void>(): Defer<T> {
   let def: Defer<T> = {
      promise: new Promise<T>((res, rej) => {}),
      resolve: () => {},
      reject: () => {}
   }

   def.promise = new Promise<T>((resolve, reject) => {
      def.resolve = resolve
      def.reject = reject
   })

   return def
}