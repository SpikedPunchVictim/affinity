import { INamespace, Namespace } from "../Namespace";
import { IRfcAction } from "../actions/Actions";
import { RfcError } from "../../errors/RfcError";
import { NamespaceCreateAction } from "../actions/Namespace";

export async function create(parent: INamespace, name: string): Promise<INamespace> {
   let namespace = new Namespace(name, parent, this.context, await this.uidGenerator.generate())
   let index = parent.children.length

   await this.rfc.create(new NamespaceCreateAction(namespace, index))
      .fulfill(async (action) => {
         this._add(namespace, parent, index, action)
      })
      .reject(async (action: IRfcAction, err?: Error) => {
         throw new RfcError(action, err)
      })
      .commit()

   return namespace
}