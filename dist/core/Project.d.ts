interface IQualifiedObject {
    name: string;
    path: string;
}
interface IModel extends IQualifiedObject {
}
interface IInstance extends IQualifiedObject {
}
interface IModelCollection {
    get(name: string): IModel;
}
interface IInstanceCollection {
}
interface INamespaceCollection {
}
interface INamespace {
    children: INamespaceCollection;
    models: IModelCollection;
    instances: IInstanceCollection;
}
interface IModelListener {
    valueChanging(handler: any): void;
    valueChanged(handler: any): void;
}
interface IModel {
    on: IModelListener;
}
interface ISearch {
}
interface IProjectListener {
    commit(handler: any): void;
    open(handler: any): void;
}
interface IProject {
    root: INamespace;
    readonly search: ISearch;
    models(): IterableIterator<IModel>;
    instances(): IterableIterator<IInstance>;
    namespaces(): IterableIterator<INamespace>;
    open(): Promise<boolean>;
    commit(): Promise<boolean>;
    readonly on: IProjectListener;
}
export default class Project implements IProject {
    root: INamespace;
    constructor();
    model(path: string): IModel | undefined;
}
export {};
