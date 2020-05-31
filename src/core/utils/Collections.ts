import { IObservableCollection, sortByIndexReverse } from "../collections/ObservableCollection"
import { ItemAdd, ItemRemove } from "../collections/ChangeSets"

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

export function syncToMaster<TMaster, TOther>(
   master: IObservableCollection<TMaster>,
   other: IObservableCollection<TOther>,
   handlers: DiffHandlers<TMaster, TOther>): void {

   let indexOfMaster = (item: TOther, start: number = 0): number => {
      for (let j = start; j < master.length; ++j) {
         if (handlers.equal(master.at(j), item)) {
            return j
         }
      }

      return -1
   }

   let indexOfOther = (item: TMaster, start: number = 0): number => {
      for (let j = start; j < other.length; ++j) {
         if (handlers.equal(item, other.at(j))) {
            return j
         }
      }

      return -1
   }

   let buildDuplicateMap = <T>(collection: IObservableCollection<T>): Map<T, number> => {
      let map = new Map<T, number>()

      for(let i = 0; i < collection.length; ++i) {
         let currentItem = collection.at(i)
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
      let otherItem = other.at(i)
      let masterIndex = indexOfMaster(otherItem)

      if(masterIndex != -1) {
         let masterItem = master.at(masterIndex)
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
      let masterItem = master.at(i)
      let otherIndex = indexOfOther(masterItem)

      if(otherIndex != -1) {
         // Check duplicates
         let otherItem = other.at(otherIndex)
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
               * Starting from the current index, move the first equal one in the other-collection
                 to the current index. By starting at the current index when scanning, we don't
                 need to worry about duplicates
   */

   // At this point, the master and other collections are the same size
   if(other.length !== master.length) {
      console.log(`${master}`)
      console.log(`${other}`)
      throw new Error(`Both master and other collection must be the same size. Check the logic above or note the edge case you've encountered`)
   }

   for(let i = 0; i < other.length; ++i) {
      let masterItem = master.at(i)
      let otherItem = other.at(i)

      if(handlers.equal(masterItem, otherItem)) {
         continue
      }

      let masterInOtherIndex = indexOfOther(masterItem, i)
      handlers.move(other.at(masterInOtherIndex), masterInOtherIndex, i, other)
   }
}

export async function syncToMasterAsync<TMaster, TOther>(
   master: IObservableCollection<TMaster>,
   other: IObservableCollection<TOther>,
   handlers: DiffHandlersAsync<TMaster, TOther>): Promise<void> {

   let indexOfMaster = async (item: TOther, start: number = 0): Promise<number> => {
      for (let j = start; j < master.length; ++j) {
         if (await handlers.equal(master.at(j), item)) {
            return j
         }
      }

      return -1
   }

   let indexOfOther = async (item: TMaster, start: number = 0): Promise<number> => {
      for (let j = start; j < other.length; ++j) {
         if (await handlers.equal(item, other.at(j))) {
            return j
         }
      }

      return -1
   }

   let buildDuplicateMap = <T>(collection: IObservableCollection<T>): Map<T, number> => {
      let map = new Map<T, number>()

      for(let i = 0; i < collection.length; ++i) {
         let currentItem = collection.at(i)
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
      let otherItem = other.at(i)
      let masterIndex = await indexOfMaster(otherItem)

      if(masterIndex != -1) {
         let masterItem = master.at(masterIndex)
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
      await handlers.remove(itemsToRemove[i].item, itemsToRemove[i].index, other)
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
      let masterItem = master.at(i)
      let otherIndex = await indexOfOther(masterItem)

      if(otherIndex != -1) {
         // Check duplicates
         let otherItem = other.at(otherIndex)
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
      await handlers.add(item.item, other.length, other)
   }

   //--- Sort
   /*
      To sort them correctly without tracking duplicates, we iterate
      from the beginning of the other-collection to the end. For each
      item we visit, we determine:
         * Are they are equal?
            * yes: Move on to the next item
            * no:
               * Starting from the current index, move the first equal one in the other-collection
                 to the current index. By starting at the current index when scanning, we don't
                 need to worry about duplicates
   */

   // At this point, the master and other collections are the same size
   if(other.length !== master.length) {
      console.log(`${master}`)
      console.log(`${other}`)
      throw new Error(`Both master and other collection must be the same size. Check the logic above or note the edge case you've encountered`)
   }

   for(let i = 0; i < other.length; ++i) {
      let masterItem = master.at(i)
      let otherItem = other.at(i)

      if(handlers.equal(masterItem, otherItem)) {
         continue
      }

      let masterInOtherIndex = await indexOfOther(masterItem, i)
      await handlers.move(other.at(masterInOtherIndex), masterInOtherIndex, i, other)
   }
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
// export function syncToMaster2<TMaster, TOther>(
//    master: IObservableCollection<TMaster>,
//    other: IObservableCollection<TOther>,
//    handlers: DiffHandlers<TMaster, TOther>): void {

//    if (master.length == 0 && other.length == 0) {
//       return
//    }

//    let maxSize = Math.max(master.length, other.length)

//    let existsInMaster = (
//       collection: IObservableCollection<TMaster>,
//       item: TOther,
//       equal: DiffEqualityHandler<TMaster, TOther>
//    ): number => {

//       for (let j = 0; j < collection.length; ++j) {
//          if (equal(collection.at(j), item)) {
//             return j
//          }
//       }

//       return -1
//    }

//    let existsInOther = (
//       collection: IObservableCollection<TOther>,
//       item: TMaster,
//       equal: DiffEqualityHandler<TMaster, TOther>
//    ): number => {

//       for (let j = 0; j < collection.length; ++j) {
//          if (equal(item, collection.at(j))) {
//             return j
//          }
//       }

//       return -1
//    }

//    for (let i = 0; i < maxSize; ++i) {
//       if (i >= other.length) {
//          // Add
//          let masterItem = master.at(i)
//          handlers.add(masterItem, i, other)
//          continue
//       }
//       else if (i >= master.length) {
//          // Remove
//          handlers.remove(other.at(i), i, other)
//          --i
//          continue
//       } else if (!handlers.equal(master.at(i), other.at(i))) {
//          /* 
//             To perform a non-destructive merge here, we:
//                * Check to see if the current other item equivalent exists in the master collection
//                  at a different index. If so, we move the current other item to the mathcing master index.
//                  If not, we know it's safe to remove the current other item, and we perform the same check
//                  with the master item equivalent in the other collection (next bullet point)
//                * Check to see if the current master item equivalent exists in the other collection.
//                  If so, we move that equivalent to the current index
//          */

//          // Replace
//          let masterItem = master.at(i)
//          let otherItem = other.at(i)

//          let otherInMasterIndex = existsInMaster(master, otherItem, handlers.equal)
//          let masterInOtherIndex = existsInOther(other, masterItem, handlers.equal)

//          if(otherInMasterIndex != -1 || masterInOtherIndex != -1) {
//             let shouldDecrement = false

//             if(otherInMasterIndex != -1) {
//                // When we move the other item, we need to revisit this index
//                // since another item has taken its place
//                handlers.move(otherItem, i, otherInMasterIndex, other)
//                shouldDecrement = true
//             }
   
//             if(masterInOtherIndex != -1) {
//                handlers.move(other.at(masterInOtherIndex), masterInOtherIndex, i, other)
//             }

//             if(shouldDecrement) {
//                --i
//             }

//             continue
//          }

//          handlers.remove(otherItem, i, other)
//          handlers.add(masterItem, i, other)
//          continue
//       }
//    }
// }

// TODO: This is copy/pasted code. Rethink how to share this logic
// between the Sync and Async versions
// export async function syncToMasterAsync<TMaster, TOther>(
//    master: IObservableCollection<TMaster>,
//    other: IObservableCollection<TOther>,
//    handlers: DiffHandlersAsync<TMaster, TOther>): Promise<void> {
//       if (master.length == 0 && other.length == 0) {
//          return
//       }
   
//       let maxSize = Math.max(master.length, other.length)
   
//       let existsInMaster = async (
//          collection: IObservableCollection<TMaster>,
//          item: TOther,
//          equal: DiffEqualityHandlerAsync<TMaster, TOther>
//       ): Promise<number> => {
   
//          for (let j = 0; j < collection.length; ++j) {
//             let isEqual = await equal(collection.at(j), item)
//             if (isEqual) {
//                return j
//             }
//          }
   
//          return -1
//       }
   
//       let existsInOther = async (
//          collection: IObservableCollection<TOther>,
//          item: TMaster,
//          equal: DiffEqualityHandlerAsync<TMaster, TOther>
//       ): Promise<number> => {
   
//          for (let j = 0; j < collection.length; ++j) {
//             let isEqual = await equal(item, collection.at(j))
//             if (isEqual) {
//                return j
//             }
//          }
   
//          return -1
//       }
   
//       for (let i = 0; i < maxSize; ++i) {
//          // let areCurrentItemsEqual = false

//          // if(i < other.length && i < master.length) {
//          //    areCurrentItemsEqual = await handlers.equal(master.at(i), other.at(i))
//          // }

//          if (i >= other.length) {
//             // Add
//             let masterItem = master.at(i)
//             await handlers.add(masterItem, i, other)
//             continue
//          }
//          else if (i >= master.length) {
//             // Remove
//             await handlers.remove(other.at(i), i, other)
//             --i
//             continue
//          } else if (!await handlers.equal(master.at(i), other.at(i))) {
//             /* 
//                To perform a non-destructive merge here, we:
//                   * Check to see if the current other item equivalent exists in the master collection
//                     at a different index. If so, we move the current other item to the mathcing master index.
//                     If not, we know it's safe to remove the current other item, and we perform the same check
//                     with the master item equivalent in the other collection (next bullet point)
//                   * Check to see if the current master item equivalent exists in the other collection.
//                     If so, we move that equivalent to the current index
//             */
   
//             // Replace
//             let masterItem = master.at(i)
//             let otherItem = other.at(i)
   
//             let otherInMasterIndex = await existsInMaster(master, otherItem, handlers.equal)
//             let masterInOtherIndex = await existsInOther(other, masterItem, handlers.equal)
   
//             if(otherInMasterIndex != -1 || masterInOtherIndex != -1) {
//                let shouldDecrement = false
   
//                if(otherInMasterIndex != -1) {
//                   // When we move the other item, we need to revisit this index
//                   // since another item has taken its place
//                   await handlers.move(otherItem, i, otherInMasterIndex, other)
//                   shouldDecrement = true
//                }
      
//                if(masterInOtherIndex != -1) {
//                   await handlers.move(other.at(masterInOtherIndex), masterInOtherIndex, i, other)
//                }
   
//                if(shouldDecrement) {
//                   --i
//                }
   
//                continue
//             }
   
//             await handlers.remove(otherItem, i, other)
//             await handlers.add(masterItem, i, other)
//             continue
//          }
//       }
//    }