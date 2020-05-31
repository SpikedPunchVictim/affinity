import { ItemRemove, ItemAdd } from "../src/core/collections/ChangeSets"
import { sortByIndexReverse } from "../src/core/collections/ObservableCollection"


async function main() {
   // test([0, 6, 3, 8, 9], [1, 2, 3, 4, 5, 6 , 7, 8, 15])
   // test([67], [1, 2, 3])
   test([5, 4, 3, 2, 0, 1, 0], [0, 2, 3, 4, 15, 3, 5, 6, 9, 11, 2, 4, 3, 7])
   test([5, 4, 3, 2, 1, 1, 0, 1, 1, 1], [3, 0, 2, 3, 4, 5, 1, 7])
   test([5, 4, 3, 2, 1, 1, 0], [0, 2, 3, 4, 5])
   test([5, 4, 3, 2, 0, 1, 0], [0, 2, 3, 4, 15])
   test([5, 4, 3, 2, 0, 1, 0], [0, 0])
}

function test(master: number[], other: number[]): void {
   console.log(`------------------------`)
   console.log(`   Start: ${other}`)

   syncToMaster2(
      master,
      other,
      {
         equal: (masterItem, otherItem) => masterItem == otherItem,
         add: (masterItem, index, collection) => collection.splice(index, 0, masterItem),
         remove: (otherItem, index, collection) => collection.splice(index, 1),
         move: (otherItem, from, to, collection) => {
            collection.splice(from, 1)
            collection.splice(to, 0, otherItem)
         }
      })

   console.log(`Expected: ${master}`)
   console.log(` Results: ${other}`)
   console.log(`------------------------`)
}


export type DiffAddHandler<TMaster, TOther> = (master: TMaster, index: number, collection: Array<TOther>) => void
export type DiffRemoveHandler<TMaster, TOther> = (other: TOther, index: number, collection: Array<TOther>) => void
export type DiffMoveHandler<TOther> = (other: TOther, from: number, to: number, collection: Array<TOther>) => void
export type DiffEqualityHandler<TMaster, TOther> = (a: TMaster, b: TOther) => boolean

export type DiffAddHandlerAsync<TMaster, TOther> = (master: TMaster, index: number, collection: Array<TOther>) => Promise<void>
export type DiffRemoveHandlerAsync<TMaster, TOther> = (other: TOther, index: number, collection: Array<TOther>) => Promise<void>
export type DiffMoveHandlerAsync<TOther> = (other: TOther, from: number, to: number, collection: Array<TOther>) => Promise<void>
export type DiffEqualityHandlerAsync<TMaster, TOther> = (a: TMaster, b: TOther) => Promise<boolean>

export type DiffHandlers<TMaster, TOther> = {
   equal: DiffEqualityHandler<TMaster, TOther>
   add: DiffAddHandler<TMaster, TOther>
   remove: DiffRemoveHandler<TMaster, TOther>
   move: DiffMoveHandler<TOther>
}

class SyncIndex {
   current: number
   max: number
   resetAtEnd: boolean

   constructor(start: number, max: number, resetAtEnd: boolean) {
      this.current = start
      this.max = max
      this.resetAtEnd = resetAtEnd
   }

   isDone(): boolean {
      if (this.current > this.max) {
         return this.resetAtEnd !== false
      }

      return this.current > this.max
   }

   next() {
      if (this.current == this.max) {
         if (this.resetAtEnd) {
            this.current = 0
            this.resetAtEnd = false
            return this.current
         }
      }

      this.current++
      return this.current
   }
}


function syncToMaster2<TMaster, TOther>(
   master: Array<TMaster>,
   other: Array<TOther>,
   handlers: DiffHandlers<TMaster, TOther>): void {

   let indexOfMaster = (item: TOther, start: number = 0): number => {
      for (let j = start; j < master.length; ++j) {
         if (handlers.equal(master[j], item)) {
            return j
         }
      }

      return -1
   }

   let indexOfOther = (item: TMaster, start: number = 0): number => {
      for (let j = start; j < other.length; ++j) {
         if (handlers.equal(item, other[j])) {
            return j
         }
      }

      return -1
   }

   let buildDuplicateMap = <T>(collection: T[]): Map<T, number> => {
      let map = new Map<T, number>()

      for(let i = 0; i < collection.length; ++i) {
         let currentItem = collection[i]
         let found = map.get(currentItem)

         if(found) {
            found++
            map.set(currentItem, found)
         } else {
            map.set(currentItem, 1)
         }
      }

      return map
   }

   // 1) Remove items from the other collection that aren't in the master collection
   // 2) Identify duplicates
   // 3) Append all new items to the other collection
   // 4) Sort them into their new indexes

   //--- Idenitfy Duplicates
   let masterDuplicates = buildDuplicateMap(master)
   let otherDuplicateMap = buildDuplicateMap(other)

   //--- Remove
   let itemsToRemove = new Array<ItemRemove<TOther>>()
   let removeCount = new Map<TOther, number>()

   let remove = (item: TOther, index: number): void => {
      itemsToRemove.push(new ItemRemove(item, index))
      
      let count = removeCount.get(item)
      if(count) {
         count++
         removeCount.set(item, count)
      } else {
         removeCount.set(item, 1)
      }
   }

   for(let i = 0; i < other.length; ++i) {
      let otherItem = other[i]
      let masterIndex = indexOfMaster(otherItem)

      if(masterIndex != -1) {
         let masterItem = master[masterIndex]
         let masterCount = masterDuplicates.get(masterItem) || 0
         let otherCount = otherDuplicateMap.get(otherItem) || 0

         if(otherCount > masterCount) {
            let numberRemoved = removeCount.get(otherItem) || 0
            
            if((otherCount - numberRemoved) > masterCount) {
               remove(otherItem, i)
            }
         }

         continue
      }

      remove(otherItem, i)
   }

   itemsToRemove.sort(sortByIndexReverse)

   for (var i = 0; i < itemsToRemove.length; ++i) {
      handlers.remove(itemsToRemove[i].item, itemsToRemove[i].index, other)
   }

   //--- Add
   let itemsToAdd = new Array<ItemAdd<TMaster>>()
   let addCount = new Map<TMaster, number>()

   // Update the duplicate map
   otherDuplicateMap = buildDuplicateMap(other)

   let add = (item: TMaster, index: number): void => {
      itemsToAdd.push(new ItemAdd(item, i))
      
      let count = addCount.get(item)
      if(count) {
         count++
         addCount.set(item, count)
      } else {
         addCount.set(item, 1)
      }
   }

   for(let i = 0; i < master.length; ++i) {
      let masterItem = master[i]
      let otherIndex = indexOfOther(masterItem)

      if(otherIndex != -1) {
         // Check duplicates
         let otherItem = other[otherIndex]
         let masterCount = masterDuplicates.get(masterItem) || 0
         let otherCount = otherDuplicateMap.get(otherItem) || 0

         if(otherCount < masterCount) {
            let numberAdded = addCount.get(masterItem) || 0

            if((numberAdded + otherCount) < masterCount) {
               add(masterItem, -1)
            }
         }
         
         continue
      }

      add(masterItem, -1)
   }

   for(let item of itemsToAdd) {
      handlers.add(item.item, other.length, other)
   }

   //--- Sort
   /*
      To sort them correctly without tracking duplicates, we iterate
      from the beginning of the other-collection to the end. For each
      item we visit, we determine:
         * Are they are equal?
            * yes: Move on to the next item
            * no:
               * Move the first equal one int he other-collection to the current index
               * Move the value that was there  

   */

   // At this point, the master and other collections are the same size
   if(other.length !== master.length) {
      console.log(`${master}`)
      console.log(`${other}`)
      throw new Error(`Both master and other collection must be the same size. Check the logic above or note the edge case you've encountered`)
   }

   for(let i = 0; i < other.length; ++i) {
      let masterItem = master[i]
      let otherItem = other[i]

      if(handlers.equal(masterItem, otherItem)) {
         continue
      }

      let masterInOtherIndex = indexOfOther(masterItem, i)
      handlers.move(other[masterInOtherIndex], masterInOtherIndex, i, other)
   }
}

export function syncToMaster<TMaster, TOther>(
   master: Array<TMaster>,
   other: Array<TOther>,
   handlers: DiffHandlers<TMaster, TOther>): void {

   if (master.length == 0 && other.length == 0) {
      return
   }

   /*
      If the length of master is greater than ther other collection,
      we must start the index at the length of the other collection.
      This is to avoid a scenario where the other collection contains
      an item that exists at an index in the master that is beyond
      the other collection's length.
   */
   let syncIndex: SyncIndex

   if (master.length > other.length) {
      syncIndex = new SyncIndex(other.length - 1, master.length - 1, true)
   } else {
      syncIndex = new SyncIndex(0, Math.max(master.length, other.length) - 1, false)
   }

   let existsInMaster = (
      collection: Array<TMaster>,
      item: TOther,
      equal: DiffEqualityHandler<TMaster, TOther>
   ): number => {

      for (let j = 0; j < collection.length; ++j) {
         if (equal(collection[j], item)) {
            return j
         }
      }

      return -1
   }

   let existsInOther = (
      collection: Array<TOther>,
      item: TMaster,
      equal: DiffEqualityHandler<TMaster, TOther>
   ): number => {

      for (let j = 0; j < collection.length; ++j) {
         if (equal(item, collection[j])) {
            return j
         }
      }

      return -1
   }

   for (let i = syncIndex.current; !syncIndex.isDone(); i = syncIndex.next()) {
      if (i >= other.length) {
         // If it already exists in the other collection, move it
         // otherwise add the new item
         let masterItem = master[i]
         let otherIndex = existsInOther(other, masterItem, handlers.equal)

         if (otherIndex != -1) {
            handlers.move(other[otherIndex], otherIndex, i, other)
         } else {
            // Add
            handlers.add(masterItem, i, other)
         }

         continue
      }
      else if (i >= master.length) {
         // Remove
         handlers.remove(other[i], i, other)
         --i
         continue
      } else if (!handlers.equal(master[i], other[i])) {
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
         let masterItem = master[i]
         let otherItem = other[i]

         // otherInMasterIndex: Move the current other-item to the index to match the master
         // masterInOtherIndex: Move the other-item to the current index
         let otherInMasterIndex = existsInMaster(master, otherItem, handlers.equal)
         let masterInOtherIndex = existsInOther(other, masterItem, handlers.equal)

         if (otherInMasterIndex == -1 && masterInOtherIndex == -1) {
            // The current other-item does not exist in the master
            // and the master-item does not exist in ther other collection.
            // We remove the current other-item and replace it with the master-item
            handlers.remove(otherItem, i, other)
            handlers.add(masterItem, i, other)
            continue
         }

         if (otherInMasterIndex != -1) {
            // When we move the other item, we need to revisit this index
            // since another item has taken its place
            handlers.move(otherItem, i, otherInMasterIndex, other)

            // Now that we have moved the contents in other, we need to
            // re-evaluate the master index
            if (masterInOtherIndex != -1) {
               masterInOtherIndex = existsInOther(other, masterItem, handlers.equal)
            }
         }

         if (masterInOtherIndex != -1 && masterInOtherIndex !== i) {
            handlers.move(other[masterInOtherIndex], masterInOtherIndex, i, other)
         } else if (masterInOtherIndex === -1) {
            // Add it
            handlers.add(masterItem, i, other)
         }
      }
   }
}

main()
   .then(() => process.exit(0))