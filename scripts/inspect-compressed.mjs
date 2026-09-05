import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { getBounds } from '@gltf-transform/functions'
import draco3d from 'draco3d'

const decoderModule = await draco3d.createDecoderModule()
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': decoderModule,
})

for (const f of process.argv.slice(2)) {
  const doc = await io.read(f)
  const scene = doc.getRoot().listScenes()[0]
  const { min, max } = getBounds(scene)
  const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]]
  console.log(f, 'size', size.map((n) => n.toFixed(3)))
  console.log('  meshes:', doc.getRoot().listMeshes().map((m) => m.getName()))
}
