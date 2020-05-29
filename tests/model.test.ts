import 'mocha'
import { expect } from 'chai'
import { Model, INamespace, IModel } from '../src/core'
import { validateQualifiedPath } from './utils/validate'
import { QualifiedObjectType } from '../src/core/utils'
import { fill } from './utils/create'

describe('Models', function() {
   it('Can be created', async function() {
      let project = await fill({
         models: [
            'one.two.model'
         ]
      })

      let two = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one.two')

      expect(two).to.not.be.undefined

      //@ts-ignore
      let model = await two.models.get('model')

      expect(model).to.not.be.undefined
      expect(model).to.be.an.instanceOf(Model)
   })

   it('Can be deleted', async function() {
      let project = await fill({
         models: [
            'one.two.model'
         ]
      })

      let two = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one.two')
      expect(two).to.not.be.undefined

      //@ts-ignore
      let model = await two.models.get('model')

      expect(model).to.not.be.undefined
      expect(model).to.be.an.instanceOf(Model)
   })

   it('Can be renamed', async function() {
      let before = 'model-before-rename'
      let after = 'model-after-rename'

      let project = await fill({
         models: [
            `one.two.${before}`
         ]
      })

      let two = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one.two')
      expect(two).to.not.be.undefined

      //@ts-ignore
      let model = await two.models.get(before)

      expect(model).to.not.be.undefined

      //@ts-ignore
      expect(model.name).to.equal(before)

      //@ts-ignore
      await model.rename(after)

      //@ts-ignore
      expect(model.name).to.equal(after)
   })

   it('Can be moved', async function() {
      let project = await fill({
         models: [
            'one.two.three.model'
         ]
      })
      
      let model = await project.get(QualifiedObjectType.Model, 'one.two.three.model')

      expect(model).to.not.be.undefined

      // @ts-ignore
      validateQualifiedPath(model, 'one.two.three.model')

      let one = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one')

      expect(one).to.not.be.undefined

      // @ts-ignore
      let oneModel = await model.move(one)

      // @ts-ignore
      validateQualifiedPath(model, 'one.model')

      expect(oneModel, `The model was not moved into the collection`).to.not.be.undefined
      expect(model).to.be.equal(oneModel)
   })

   describe('# Members', function() {
      it('Add string', async function() {
         let project = await fill({
            models: [
               'one.two.model'
            ]
         })

         let model = await project.get<IModel>(QualifiedObjectType.Model, 'one.two.model')

         //@ts-ignore
         await model.append({
            string: '#1',
            string2: '#2'
         })
      })
   })
})