export interface INamedObject {
    readonly name: string;
    rename(name: string): Promise<INamedObject>;
}
export declare class NamedObject implements INamedObject {
    readonly name: string;
    constructor(name: string);
    rename(name: string): Promise<INamedObject>;
}
