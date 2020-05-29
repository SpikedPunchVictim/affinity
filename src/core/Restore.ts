export abstract class RestoreInfo {
   name: string = ""          // Namespace name
   qualifiedPath: string = "" // Qualified path of the namespace
   id: string = ""            // Namespace ID
   parentId: string = ""      // ID of the Parent
   index: number = -1         // The index of the Namespace in its parent collection

   constructor(
      name: string = "",
      qualifiedPath: string = "",
      id: string = "",
      parentId: string = "",
      index: number = -1) {
         this.name = name
         this.qualifiedPath = qualifiedPath
         this.id = id
         this.parentId = parentId
         this.index = index
      }
}