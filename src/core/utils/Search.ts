type GetChildren<T> = (parent: T) => T[]
type VisitHandler<T> = (node: T) => void

/**
 * Traverses a Tree structure in depth first order, and visits each node
 * 
 * @param parent The parent Node
 * @param getChildren Provided a Parent, returns its children
 * @param visit Called on a node when visited
 */
export function depthFirst<T>(parent: T, getChildren: GetChildren<T>, visit: VisitHandler<T>): void {
   let children = getChildren(parent)

   for(let child of children) {
      depthFirst(child, getChildren, visit)
      visit(child)
   }

   visit(parent)
}