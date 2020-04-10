/**
 * Provided a qualified path, this function will return the last
 * element in that name.
 * 
 * For example:
 *    one.two.three --> three
 *    '' --> ''  Empty string returns Empty string
 * 
 * @param qualifiedPath A period (.) delimited path
 */
export function basename(qualifiedPath: string): string {
   if(qualifiedPath == null) {
      throw new Error(`qualfiiedPath must be valid`)
   }

   let tokens = qualifiedPath.split('.')
   return tokens.length == 0 ? '' : tokens[tokens.length - 1]
}

/**
 * Provided a qualified path, will return the parent path, excluding
 * the last element.
 * 
 * For example:
 *    one.two.three --> one.two
 *    '' --> undefined
 * 
 * @param qualifiedPath A period (.) delimited path
 */
export function parentPath(qualifiedPath: string): string | undefined {
   if(qualifiedPath == null) {
      throw new Error(`qualfiiedPath must be valid`)
   }

   let tokens = qualifiedPath.split('.')

   if(tokens.length === 0) {
      return undefined
   }

   tokens.splice(-1, 1)
   return tokens.join('.')
}
