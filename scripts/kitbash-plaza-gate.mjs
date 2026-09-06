// PRD v2 §4.3 — "a welcome arch/gate spanning the road at the plaza... the
// same programmatic-kitbash technique used for the Robotics Workshop."
// Two Building Kit columns + a stretched plating beam as the crossbar.
import { NodeIO, Document } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { mergeDocuments, dedup, unpartition } from '@gltf-transform/functions'

const KIT = process.argv[2] // path to Building Kit's "Models/GLB format" dir
const OUT = process.argv[3]

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
const target = new Document()
const scene = target.createScene('PlazaGate')

const cache = new Map()
async function readCached(file) {
  if (!cache.has(file)) cache.set(file, await io.read(`${KIT}/${file}`))
  return cache.get(file)
}

async function place(file, [x, y, z], scaleVec, rotDegY = 0) {
  const source = await readCached(file)
  const map = mergeDocuments(target, source)
  const sourceScene = source.getRoot().listScenes()[0]
  const targetScene = map.get(sourceScene)

  const rad = (rotDegY * Math.PI) / 180
  const root = target
    .createNode(file)
    .setTranslation([x, y, z])
    .setRotation([0, Math.sin(rad / 2), 0, Math.cos(rad / 2)])
    .setScale(scaleVec)
  for (const child of [...targetScene.listChildren()]) root.addChild(child)
  scene.addChild(root)
}

const COLUMN_SCALE = 2.2
const COLUMN_HEIGHT = 2.4 * COLUMN_SCALE // native column height 2.4m

await place('column-wide.glb', [0, 0, -2], [COLUMN_SCALE, COLUMN_SCALE, COLUMN_SCALE])
await place('column-wide.glb', [0, 0, 2], [COLUMN_SCALE, COLUMN_SCALE, COLUMN_SCALE])
// Beam: native plating-wide.glb is 0.1(x) x 1.0(y) x 2.0(z) — stretch z to
// span the 4m gap between the two columns' centers.
await place('plating-wide.glb', [0, COLUMN_HEIGHT, 0], [2.2, 1.3, 2.0])
// A flat cap on top of the beam for a slightly fancier silhouette.
await place('roof-flat-square.glb', [0, COLUMN_HEIGHT + 1.3 * 1.0, 0], [1.8, 1, 1.8])

await target.transform(dedup(), unpartition())
await io.write(OUT, target)
console.log('wrote (uncompressed)', OUT)
