import { IQualifiedObject, QualifiedObject } from './QualifiedObject';
import { EditHandler } from './Edit';
import { INamespace } from './Namespace';
import { EventHandler } from './events/EventRouter';
import { IEvent } from './events/Base';
import { IMemberCollection } from './collections/MemberCollection';
import { IProjectContext } from './Project';
export interface IModelListener {
    valueChanging(handler: any): void;
    valueChanged(handler: any): void;
}
export declare class ModelEdit {
}
export interface IModel extends IQualifiedObject {
    readonly members: IMemberCollection;
    apply(model: EditHandler<ModelEdit>): Promise<IModel>;
    on<T extends IEvent>(handler: EventHandler<T>): void;
}
export declare class Model extends QualifiedObject implements IModel {
    readonly members: IMemberCollection;
    readonly context: IProjectContext;
    constructor(parent: INamespace, name: string, context: IProjectContext);
    on<T extends IEvent>(handler: EventHandler<T>): void;
    apply(model: EditHandler<ModelEdit>): Promise<IModel>;
}
