import { IObservableCollection } from "../collections/ObservableCollection"

export type DiffAddHandler<TMaster, TOther> = (master: TMaster, index: number, collection: IObservableCollection<TOther>) => void
export type DiffRemoveHandler<TMaster, TOther> = (other: TOther, index: number, collection: IObservableCollection<TOther>) => void
export type DiffMoveHandler<TOther> = (other: TOther, from: number, to: number, collection: IObservableCollection<TOther>) => void
export type DiffEqualityHandler<TMaster, TOther> = (a: TMaster, b: TOther) => boolean

export type DiffAddHandlerAsync<TMaster, TOther> = (master: TMaster, index: number, collection: IObservableCollection<TOther>) => Promise<void>
export type DiffRemoveHandlerAsync<TMaster, TOther> = (other: TOther, index: number, collection: IObservableCollection<TOther>) => Promise<void>
export type DiffMoveHandlerAsync<TOther> = (other: TOther, from: number, to: number, collection: IObservableCollection<TOther>) => Promise<void>
export type DiffEqualityHandlerAsync<TMaster, TOther> = (a: TMaster, b: TOther) => Promise<boolean>

export type DiffHandlers<TMaster, TOther> = {
   equal: DiffEqualityHandler<TMaster, TOther>
   add: DiffAddHandler<TMaster, TOther>
   remove: DiffRemoveHandler<TMaster, TOther>
   move: DiffMoveHandler<TOther>
}

export type DiffHandlersAsync<TMaster, TOther> = {
   equal: DiffEqualityHandlerAsync<TMaster, TOther>
   add: DiffAddHandlerAsync<TMaster, TOther>
   remove: DiffRemoveHandlerAsync<TMaster, TOther>
   move: DiffMoveHandlerAsync<TOther>
}

/**
 * Synchronizes two collections, with one of them being the master collection. The
 * master collection is impressed onto the "other" collection. When this function
 * ends, the "other" collection mirrors the master.
 * 
 * Note: 
 * This is a non-destructive sync. Elements that still exist after the sync
 * are preserved. Any elements that no longer exist are removed from the "other"
 * collection.
 * 
 * -- Copy Paste Section For Handler --
 * 
 * 
 * {
 * 
 *     equal: (master: TMaster, other: TOther): boolean => {
 *
 *     },
 *     add: (master: TMaster, index: number, collection: IObservableCollection<TOther>): void {
 *
 *     },
 *     remove: (other: TOther, index: number, collection: IObservableCollection<TOther>): void => {
 *        
 *     },
 *     move: (other, from: Number, to: Number, collection: IObservableCollection<TOther>): void => {
 *        
 *     }
 *  }
 * 
 * @param master The master collection that contains the desired order
 * @param other The other collection that needs to be updated
 * @param handlers Set of handlers for the update operations. It contains:
 *    * equal {function(a: TMaster, b: TOther): boolean}: Determines equality
 *    * add {function(master: TMaster, index: number, collection: IObservableCollection<TOther>) => void}: Adds a TMaster item into the TOther collection
 *    * remove {function(other: TOther, index: number, collection: IObservableCollection<TOther>) => void}: Removes a TMaster item from the TOther collection
 *    * move {function(other: TOther, from: number, to: number, collection: IObservableCollection<TOther>) => void}: Moves a TOther item
 */
export function syncToMaster<TMaster, TOther>(
   master: IObservableCollection<TMaster>,
   other: IObservableCollection<TOther>,
   handlers: DiffHandlers<TMaster, TOther>): void {

   if (master.length == 0 && other.length == 0) {
      return
   }

   let maxSize = Math.max(master.length, other.length)

   let existsInMaster = (
      collection: IObservableCollection<TMaster>,
      item: TOther,
      equal: DiffEqualityHandler<TMaster, TOther>
   ): number => {

      for (let j = 0; j < collection.length; ++j) {
         if (equal(collection.at(j), item)) {
            return j
         }
      }

      return -1
   }

   let existsInOther = (
      collection: IObservableCollection<TOther>,
      item: TMaster,
      equal: DiffEqualityHandler<TMaster, TOther>
   ): number => {

      for (let j = 0; j < collection.length; ++j) {
         if (equal(item, collection.at(j))) {
            return j
         }
      }

      return -1
   }

   for (let i = 0; i < maxSize; ++i) {
      if (i >= other.length) {
         // Add
         let masterItem = master.at(i)
         handlers.add(masterItem, i, other)
         continue
      }
      else if (i >= master.length) {
         // Remove
         handlers.remove(other.at(i), i, other)
         --i
         continue
      } else if (!handlers.equal(master.at(i), other.at(i))) {
         /* 
            To perform a non-destructive merge here, we:
               * Check to see if the current other item equivalent exists in the master collection
                 at a different index. If so, we move the current other item to the mathcing master index.
                 If not, we know it's safe to remove the current other item, and we perform the same check
                 with the master item equivalent in the other collection (next bullet point)
               * Check to see if the current master item equivalent exists in the other collection.
                 If so, we move that equivalent to the current index
         */

         // Replace
         let masterItem = master.at(i)
         let otherItem = other.at(i)

         let otherInMasterIndex = existsInMaster(master, otherItem, handlers.equal)
         let masterInOtherIndex = existsInOther(other, masterItem, handlers.equal)

         if(otherInMasterIndex != -1 || masterInOtherIndex != -1) {
            let shouldDecrement = false

            if(otherInMasterIndex != -1) {
               // When we move the other item, we need to revisit this index
               // since another item has taken its place
               handlers.move(otherItem, i, otherInMasterIndex, other)
               shouldDecrement = true
            }
   
            if(masterInOtherIndex != -1) {
               handlers.move(other.at(masterInOtherIndex), masterInOtherIndex, i, other)
            }

            if(shouldDecrement) {
               --i
            }

            continue
         }

         handlers.remove(otherItem, i, other)
         handlers.add(masterItem, i, other)
         continue
      }
   }
}

// TODO: This is copy/pasted code. Rethink how to share this logic
// between the Sync and Async versions
export async function syncToMasterAsync<TMaster, TOther>(
   master: IObservableCollection<TMaster>,
   other: IObservableCollection<TOther>,
   handlers: DiffHandlersAsync<TMaster, TOther>): Promise<void> {
      if (master.length == 0 && other.length == 0) {
         return
      }
   
      let maxSize = Math.max(master.length, other.length)
   
      let existsInMaster = async (
         collection: IObservableCollection<TMaster>,
         item: TOther,
         equal: DiffEqualityHandlerAsync<TMaster, TOther>
      ): Promise<number> => {
   
         for (let j = 0; j < collection.length; ++j) {
            let isEqual = await equal(collection.at(j), item)
            if (isEqual) {
               return j
            }
         }
   
         return -1
      }
   
      let existsInOther = async (
         collection: IObservableCollection<TOther>,
         item: TMaster,
         equal: DiffEqualityHandlerAsync<TMaster, TOther>
      ): Promise<number> => {
   
         for (let j = 0; j < collection.length; ++j) {
            let isEqual = await equal(item, collection.at(j))
            if (isEqual) {
               return j
            }
         }
   
         return -1
      }
   
      for (let i = 0; i < maxSize; ++i) {
         // let areCurrentItemsEqual = false

         // if(i < other.length && i < master.length) {
         //    areCurrentItemsEqual = await handlers.equal(master.at(i), other.at(i))
         // }

         if (i >= other.length) {
            // Add
            let masterItem = master.at(i)
            await handlers.add(masterItem, i, other)
            continue
         }
         else if (i >= master.length) {
            // Remove
            await handlers.remove(other.at(i), i, other)
            --i
            continue
         } else if (!await handlers.equal(master.at(i), other.at(i))) {
            /* 
               To perform a non-destructive merge here, we:
                  * Check to see if the current other item equivalent exists in the master collection
                    at a different index. If so, we move the current other item to the mathcing master index.
                    If not, we know it's safe to remove the current other item, and we perform the same check
                    with the master item equivalent in the other collection (next bullet point)
                  * Check to see if the current master item equivalent exists in the other collection.
                    If so, we move that equivalent to the current index
            */
   
            // Replace
            let masterItem = master.at(i)
            let otherItem = other.at(i)
   
            let otherInMasterIndex = await existsInMaster(master, otherItem, handlers.equal)
            let masterInOtherIndex = await existsInOther(other, masterItem, handlers.equal)
   
            if(otherInMasterIndex != -1 || masterInOtherIndex != -1) {
               let shouldDecrement = false
   
               if(otherInMasterIndex != -1) {
                  // When we move the other item, we need to revisit this index
                  // since another item has taken its place
                  await handlers.move(otherItem, i, otherInMasterIndex, other)
                  shouldDecrement = true
               }
      
               if(masterInOtherIndex != -1) {
                  await handlers.move(other.at(masterInOtherIndex), masterInOtherIndex, i, other)
               }
   
               if(shouldDecrement) {
                  --i
               }
   
               continue
            }
   
            await handlers.remove(otherItem, i, other)
            await handlers.add(masterItem, i, other)
            continue
         }
      }
   }