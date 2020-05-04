import { IType, IValue, Value, IArrayValue } from "./Value"
import { ArgumentError } from "../../errors/ArgumentError"
import { asValue, asType } from "../utils/Types"
import { IValueAttachment } from "./ValueFactory"

export type VisitValueHandler = (value: IValue) => void
export type PredicateValueHandler = (value: IValue) => boolean

export interface IArrayValue extends IValue {
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

export class ArrayType implements IType {
   readonly name: string = "type-array"
   readonly itemType: IType

   constructor(itemType: IType) {
      this.itemType = itemType
   }

   equals(other: IType): boolean {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      let arrayType = asType<ArrayType>(other)

      return other.name === this.name && arrayType.itemType.equals(this.itemType)
   }
}

export class ArrayValue extends Value implements IArrayValue {
   private _value: Array<IValue>

   get value(): Array<IValue> {
      return this._value
   }

   get itemType(): IType {
      let arrType = asType<ArrayType>(this.type)
      return arrType.itemType
   }

   constructor(itemType: IType, updater: IValueAttachment, values?: IValue[]) {
      super(new ArrayType(itemType), updater)
      this._value = new Array<IValue>()

      if(values) {
         let found = values.find((v) => this.itemType.equals(v.type))

         if(found !== undefined) {
            throw new ArgumentError(`The values provided do not match the type for this Array`)
         }

         values.forEach((value, index) => {
            this._value.splice(index, 0, value)
         })
      }
   }

   equals(other: IValue): boolean {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      let otherArray = asValue<IArrayValue>(other)

      let isEqual = this.type.equals(other.type) &&
         (this._value.length === otherArray.length)

      if(!isEqual) {
         return false
      }
   }

   clone(): IValue {
      return new BoolValue(this.value, this.attachment)
   }

   async update(other: IValue): Promise<IValue> {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      if(!other.type.equals(this.type)) {
         throw new ArgumentError(`Cannot update a BoolValue with an incompatible value`)
      }

      return await this.attachment.request(other, this, () => {
         let boolVal = asValue<BoolValue>(other)
         this._value = boolVal.value
         return this
      })
   }


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