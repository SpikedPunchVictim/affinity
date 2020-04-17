import { expect } from 'chai'
import { IQualifiedObject } from '../../src/core/QualifiedObject'
import { basename } from '../../src/core/utils/QualifiedPath'

export function validateQualifiedPath(obj: IQualifiedObject, qualifiedPath: string) {
   let base = basename(qualifiedPath)
   
   expect(obj.name).to.equal(base)
   expect(obj.qualifiedName).to.equal(qualifiedPath)
}

export async function doesReject(fn: () => Promise<void>): Promise<boolean> {
   try {
      await fn()
   } catch(err) {
      return true   
   }

   return false
}