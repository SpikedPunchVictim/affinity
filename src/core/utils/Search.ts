type GetChildren<T> = (parent: T) => T[]
type VisitHandler<T> = (node: T) => void

export function depthFirst<T>(parent: T, getChildren: GetChildren<T>, visit: VisitHandler<T>): void {
   let children = getChildren(parent)

   for(let child of children) {
      depthFirst(child, getChildren, visit)
      visit(child)
   }

   visit(parent)
}