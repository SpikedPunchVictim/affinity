import { IQualifiedObject } from './QualifiedObject'

interface RequestForChange<T> {
   item: T
}

export interface IModelListener {
   valueChanging(handler: any): void
   valueChanged(handler: any): void
}

export interface IModel extends IQualifiedObject {
   apply(rfc: RequestForChange<IModel>): Promise<IModel>
}

/*
let rfc = model.rfc()


*/
