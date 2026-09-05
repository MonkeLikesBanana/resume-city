import { NodeIO } from '@gltf-transform/core'
import { getBounds } from '@gltf-transform/functions'

const io = new NodeIO()
const files = process.argv.slice(2)
for (const f of files) {
  const doc = await io.read(f)
  const scene = doc.getRoot().listScenes()[0]
  const { min, max } = getBounds(scene)
  const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]]
  console.log(f.split('/').pop(), 'min', min.map((n) => n.toFixed(3)), 'max', max.map((n) => n.toFixed(3)), 'size', size.map((n) => n.toFixed(3)))
}
