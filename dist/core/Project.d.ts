import { INamespace } from './Namespace';
import { IRequestForChangeSource } from './RequestForChange';
import { IEventRouter } from './events/EventRouter';
export declare type UseHandler = (events: IEventRouter) => void;
interface IProject {
    root: INamespace;
}
export interface IProjectContext {
    rfcSource: IRequestForChangeSource;
}
export interface IProjectOptions {
    rfcSource?: IRequestForChangeSource;
}
export declare class Project implements IProject {
    root: INamespace;
    readonly context: IProjectContext;
    constructor(options?: IProjectOptions);
}
export {};
