import { ItemAdd, ItemRemove, ItemMove } from "../collections/ChangeSets"
import { IObservableCollection } from "../collections/ObservableCollection"

export type DiffAddHandler<TMaster, TOther> = (master: TMaster, index: number, collection: IObservableCollection<TOther>) => void
export type DiffRemoveHandler<TMaster, TOther> = (master: TMaster, other: TOther, index: number, collection: IObservableCollection<TOther>) => void
export type DiffMoveHandler<TOther> = (other: TOther, from: number, to: number, collection: IObservableCollection<TOther>) => void
export type DiffEqualityHandler<TMaster, TOther> = (a: TMaster, b: TOther) => boolean

export type DiffChangeset<T> = {
   add: ItemAdd<T>[]
   remove: ItemRemove<T>[]
   move: ItemMove<T>[]
}

export type DiffHandlers<TMaster, TOther> = {
   equal: DiffEqualityHandler<TMaster, TOther>
   add: DiffAddHandler<TMaster, TOther>
   remove: DiffRemoveHandler<TMaster, TOther>
   move: DiffMoveHandler<TOther>
}

/**
 * Synchronizes two collections, with one of them being the master collection.
 * This is a non-destructive sync. ie Caution is taken to secure references
 * to elements that might already be in use.
 * 
 * @param master The master collection that contains the desired order
 * @param other The other collection that needs to be updated
 * @param handlers Set of handlers for the update operations
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
         handlers.remove(master.at(i), other.at(i), i, other)
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

         handlers.remove(masterItem, otherItem, i, other)
         handlers.add(masterItem, i, other)
         continue
      }
   }
}