import { INamespace, Namespace } from "../Namespace";
import { IProjectContext } from "../Project";
import { NamespaceCreateAction } from "../actions/Namespace";
import { NamedCollection, INamedCollection } from "./NamedCollection";
import { EventMap, ItemAdd, ItemMove, ItemRemove } from "./ObservableCollection";
import { Events } from "../Events";
import { IRfcAction } from "../actions/Actions";

export interface INamespaceCollection extends INamedCollection<INamespace> {
   create(name: string): Promise<INamespace>
}

const NamespaceCollectionEventMap = new EventMap({
   adding: Events.NamespaceCollection.Adding,
   added: Events.NamespaceCollection.Added,
   moving:  Events.NamespaceCollection.Moving,
   moved: Events.NamespaceCollection.Moved,
   removing: Events.NamespaceCollection.Removing,
   removed: Events.NamespaceCollection.Removed
})

export class NamespaceCollection 
   extends NamedCollection<INamespace>
   implements INamespaceCollection {
   
   readonly parent: INamespace
   readonly context: IProjectContext

   get rfc() {
      return this.context.rfc
   }
   
   constructor(parent: INamespace, context: IProjectContext) {
      super(NamespaceCollectionEventMap)
      this.parent = parent
      this.context = context
      
      this.changeRequests = {
         add: this.onAdd,
         move: this.onMove,
         moveIn: this.onMoveIn,
         moveOut: this.onMoveOut,
         remove: this.onRemove
      }
   }

   async create(name: string): Promise<INamespace> {
      return new Promise((resolve, reject) => {
         let namespace = new Namespace(this.parent, name, this.context)

         this.rfc.create(new NamespaceCreateAction(namespace))
            .fulfill(async (action) => {
               await this.add(namespace, { ignoreChangeRequest: true })
               return resolve(namespace)
            })
            .reject(async (action: IRfcAction, err?: Error) => {
               return reject(err)
            })
            .commit()      
      })
   }

   async onAdd(items: Array<ItemAdd<INamespace>>, array: Array<INamespace>): Promise<boolean> {
      return true
   }

   async onMove(items: Array<ItemMove<INamespace>>, array: Array<INamespace>): Promise<boolean> {
      return true
   }

   async onRemove(items: Array<ItemRemove<INamespace>>, array: Array<INamespace>): Promise<boolean> {
      return true
   }

   async onMoveIn(items: Array<ItemAdd<INamespace>>): Promise<boolean> {
      return true
   }

   async onMoveOut(items: Array<ItemRemove<INamespace>>): Promise<boolean> {
      return true
   }
}