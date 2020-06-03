import { IType, IValue, Value, IValueSource } from "./Value"
import { ArgumentError } from "../../errors/ArgumentError"
import { asValue, asType } from "../utils/Types"
import { IValueAttachment, EmptyValueAttachment } from "./ValueAttachment"
import { IndexOutOfRangeError } from "../../errors"
import { ObservableCollection, IObservableCollection } from "../collections/ObservableCollection"
import { syncToMaster } from "../utils/Collections"
import { ItemAdd } from "../collections/ChangeSets"

export type VisitValueHandler = (value: IValue) => void
export type PredicateValueHandler = (value: IValue) => boolean

export interface IListValue extends IValue {
   readonly length: number

   [Symbol.iterator](): Iterator<IValue>
   at(index: number): IValue
   add(...value: Array<IValue>): Promise<void>
   clear(): Promise<boolean>
   contains(value: IValue): boolean
   filter(visit: VisitValueHandler): Array<IValue>
   find(visit: VisitValueHandler): IValue | undefined
   forEach(visit: VisitValueHandler): void
   indexOf(value: IValue): number | undefined
   insert(index: number, value: IValue): Promise<boolean>
   map(visit: VisitValueHandler): void[]
   move(from: number, to: number): Promise<boolean>
   remove(values: IValue | IValue[]): Promise<boolean>
   removeAt(index: number): Promise<boolean>
   removeAll(filter: PredicateValueHandler): Promise<boolean>
}

export class ListType implements IType {
   readonly name: string = "type-array"
   readonly itemType: IType

   constructor(itemType: IType) {
      this.itemType = itemType
   }

   equals(other: IType): boolean {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      let arrayType = asType<ListType>(other)

      return other.name === this.name && arrayType.itemType.equals(this.itemType)
   }
}

export class ListValue extends Value implements IListValue {
   private _values: ObservableCollection<IValue>

   get values(): ObservableCollection<IValue> {
      return this._values
   }

   get itemType(): IType {
      let arrType = asType<ListType>(this.type)
      return arrType.itemType
   }

   get length(): number {
      return this._values.length
   }

   constructor(itemType: IType, attachment: IValueAttachment, values?: IValue[]) {
      super(new ListType(itemType), attachment)
      this._values = new ObservableCollection<IValue>()

      if(values) {
         let found = values.find((v) => this.itemType.equals(v.type))

         if(found !== undefined) {
            throw new ArgumentError(`The values provided do not match the type for this Array`)
         }

         let cloned = values.map(v => v.clone())

         values.forEach((value, index) => {
            this._values.customAdd(cloned, (change, op) => op())
         })
      }
   }

   [Symbol.iterator](): Iterator<IValue> {
      let index = 0
      let self = this
      return {
         next(): IteratorResult<IValue> {
            return index == self._values.length ?
               { value: undefined, done: true } :
               { value: self._values[index++], done: false }
         }
      }
   }

   equals(other: IValue): boolean {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      let otherArray = asValue<ListValue>(other)

      let isEqual = this.type.equals(other.type) &&
         (this._values.length === otherArray.length) &&
         (this.itemType.equals(otherArray.itemType))

      if(!isEqual) {
         return false
      }

      for(let i = 0; i < this._values.length; ++i) {
         if(!this.at(i).equals(otherArray.at(i))) {
            return false
         }
      }

      return true
   }

   clone(): IValue {
      return new ListValue(this.itemType, this.attachment, Array.from(this._values))
   }

   at(index: number): IValue {
      return this._values[index]
   }

   async add(...values: Array<IValue>): Promise<void> {
      if(values == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      for(let value of values) {
         if(!this.itemType.equals(value.type)) {
            throw new ArgumentError(`Th values being added must match the itemType`)
         }
      }

      let newValue = asValue<ListValue>(this.clone())
      await newValue.add(...values)

      await this.attachment.request(this, newValue, () => {
         for(let value of values) {
            this._values.add(value.clone())
         }

         return this
      })
   }

   async clear(): Promise<boolean> {
      let newValue = asValue<ListValue>(this.clone())
      await newValue._values.clear()

      try {
         await this.attachment.request(this, newValue, () => {
            this._values.clear()
            return this
         })

         return true
      } catch(err) {
         return false
      }
   }

   contains(value: IValue): boolean {
      return this._values.find(v => v.equals(value)) !== undefined
   }

   filter(visit: VisitValueHandler): Array<IValue> {
      return this._values.filter(visit)
   }

   find(visit: VisitValueHandler): IValue | undefined{
      return this._values.find(visit)
   }

   forEach(visit: VisitValueHandler): void {
      this._values.forEach(visit)
   }

   indexOf(value: IValue): number | undefined {
      for(let i = 0; i < this._values.length; ++i) {
         if(this._values[i].equals(value)) {
            return i
         }
      }

      return undefined
   }

   async insert(index: number, value: IValue): Promise<boolean> {
      if(index < 0 || index > this._values.length) {
         throw new IndexOutOfRangeError(index)
      }

      let newValue = asValue<ListValue>(this.clone())
      await newValue._values.insert(index, value.clone())

      try {
         await this.attachment.request(this, newValue, () => {
            this._values.insert(index, value.clone())
            return this
         })

         return true
      } catch(err) {
         throw err
      }
   }

   map(visit: VisitValueHandler): void[] {
      return this._values.map(visit)
   }

   async move(from: number, to: number): Promise<boolean> {
      if(from < 0 || from >= this._values.length) {
         throw new IndexOutOfRangeError(from)
      }

      if(to < 0 || to >= this._values.length) {
         throw new IndexOutOfRangeError(to)
      }

      let newValue = asValue<ListValue>(this.clone())
      await newValue._values.move(from, to)

      try {
         await this.attachment.request(this, newValue, () => {
            this._values.move(from, to)
            return this
         })

         return true
      } catch(err) {
         throw err
      }
   }

   async remove(values: IValue | IValue[]): Promise<boolean> {
      if(values == null) {
         throw new ArgumentError(`values must be valid`)
      }

      if(!Array.isArray(values)) {
         values = [values]
      }

      let newValue = asValue<ListValue>(this.clone())
      await newValue.remove(values)

      try {
         await this.attachment.request(this, newValue, () => {
            this._values.remove(values)
            return this
         })

         return true
      } catch(err) {
         throw err
      }
   }

   async removeAt(index: number): Promise<boolean> {
      if(index < 0 || index >= this.length) {
         throw new IndexOutOfRangeError(index)
      }

      let newValue = asValue<ListValue>(this.clone())
      await newValue.removeAt(index)

      try {
         await this.attachment.request(this, newValue, () => {
            this._values.removeAt(index)
            return this
         })

         return true
      } catch(err) {
         throw err
      }
   }

   async removeAll(filter: PredicateValueHandler): Promise<boolean> {
      if(filter == null) {
         throw new ArgumentError(`filter must be valid`)
      }

      let newValue = asValue<ListValue>(this.clone())
      await newValue.removeAll(filter)

      try {
         await this.attachment.request(this, newValue, () => {
            this._values.removeAll(filter)
            return this
         })

         return true
      } catch(err) {
         throw err
      }
   }

   internalSet(other: IValue): IValue {
      if(!this.type.equals(other.type)) {
         throw new Error(`List type does not match the value to be set`)
      }

      let otherList = other as ListValue

      syncToMaster(
         otherList._values,
         this._values,
         {
            equal: (master: IValue, other: IValue): boolean => master.equals(other),
            add: (master: IValue, index: number, collection: IObservableCollection<IValue>): void => {
               this._values.customAdd(master.clone(), (change, add) => {
                  let ch = [new ItemAdd(change[0].item, index)]

                  // TODO: Emit events locally (no plugins)
                  //this.emit(Events.)
                  add(ch)
               })
            },
            remove: (other: IValue, index: number, collection: IObservableCollection<IValue>): void => {
               this._values.customRemove(other, (change, remove) => {
                  // TODO: Emit events locally
                  remove()
               })
            },
            move: (other: IValue, from: number, to: number, collection: IObservableCollection<IValue>): void => {
               this._values.customMove(from, to, (change, move) => {
                  // TODO: Emit events locally
                  move()
               })
            }
           }
         )
      
      return this
   }
}

export class ListValueSource implements IValueSource {
   type(itemType: IType): IType {
      return new ListType(itemType)
   }

   value(itemType: IType): IValue {
      return new ListValue(itemType, new EmptyValueAttachment())
   }
}