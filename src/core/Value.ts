export interface IType {
   readonly name: string
   equals(other: IType): boolean
}

export interface IValue {
   readonly type: IType
   equals(other: IValue): boolean
   clone(): IValue
   update(other: IValue): IValue
}