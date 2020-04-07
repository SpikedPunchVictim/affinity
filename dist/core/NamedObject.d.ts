export interface INamedObject {
    name: string;
}
export declare class NamedObject implements INamedObject {
    private _name;
    constructor(name: string);
    get name(): string;
    set name(value: string);
    getName(): string;
}
