import 'mocha'
import { expect } from 'chai'
import { Project } from '../src'
import { Model, INamespace } from '../src/core'
import { validateQualifiedPath } from './utils/validate'
import { QualifiedObjectType } from '../src/core/utils'

describe('Models', function() {
   it('Can be created', async function() {
      let project = new Project()

      let two = await project.create('one.two')
      let model = await two.models.create('model')

      expect(model).to.not.be.undefined
      expect(model).to.be.an.instanceOf(Model)
   })

   it('Can be deleted', async function() {
      let project = new Project()

      let two = await project.create('one.two')
      let model = await two.models.create('model')

      expect(model).to.not.be.undefined
      expect(model).to.be.an.instanceOf(Model)
   })

   it('Can be renamed', async function() {
      let project = new Project()

      let before = 'model-before-rename'
      let after = 'model-after-rename'

      let two = await project.create('one.two')
      let model = await two.models.create(before)

      expect(model).to.not.be.undefined
      expect(model.name).to.equal(before)

      await model.rename(after)

      expect(model.name).to.equal(after)
   })

   it('Can be moved', async function() {
      let project = new Project()

      let three = await project.create('one.two.three')
      let model = await three.models.create('model')

      expect(model).to.not.be.undefined

      // @ts-ignore
      validateQualifiedPath(model, 'one.two.three.model')

      let one = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one')

      expect(one).to.not.be.undefined

      // @ts-ignore
      await model.move(one)

      // @ts-ignore
      validateQualifiedPath(model, 'one.model')

      // @ts-ignore
      let oneModel = one.models.get('model')

      expect(oneModel, `The model was not moved into the collection`).to.not.be.undefined
      expect(model).to.be.equal(oneModel)
   })
})