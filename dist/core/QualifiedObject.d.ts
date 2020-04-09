import { INamedObject, NamedObject } from './NamedObject';
import { INamespace } from './Namespace';
export interface IQualifiedObject extends INamedObject {
    readonly qualifiedName: string;
    readonly parent: INamespace | null;
    move(name: string): Promise<IQualifiedObject>;
}
export declare class QualifiedObject extends NamedObject {
    get qualifiedName(): string;
    get parent(): INamespace;
    private _parent;
    constructor(parent: INamespace, name: string);
    move(name: string): Promise<IQualifiedObject>;
}
