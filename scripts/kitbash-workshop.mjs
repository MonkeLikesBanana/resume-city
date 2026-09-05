// PRD §4.1 Path A / §13 Phase 8 note: "v1's Robotics Workshop is a Kenney
// Building-Kit kitbash." Composes modular Building Kit pieces (2m grid unit,
// 2.4m wall height) into a two-story flagship building: ground floor has a
// wide open doorway (garage-bay look), second floor has windows, flat roof
// with a small vent for detail. Programmatic kitbash via gltf-transform
// instead of a DCC tool — no Blender available in this environment.
import { NodeIO, Document } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { mergeDocuments, dedup, unpartition } from '@gltf-transform/functions'

const KIT = process.argv[2] // path to "Models/GLB format" dir
const OUT = process.argv[3]

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
const target = new Document()
const scene = target.createScene('Workshop')

const cache = new Map()
async function readCached(file) {
  if (!cache.has(file)) cache.set(file, await io.read(`${KIT}/${file}`))
  return cache.get(file)
}

function quatY(deg) {
  const rad = (deg * Math.PI) / 180
  return [0, Math.sin(rad / 2), 0, Math.cos(rad / 2)]
}

async function place(file, [x, y, z], rotDeg = 0, name = file) {
  const source = await readCached(file)
  const map = mergeDocuments(target, source)
  const sourceScene = source.getRoot().listScenes()[0]
  const targetScene = map.get(sourceScene)

  const root = target.createNode(name).setTranslation([x, y, z]).setRotation(quatY(rotDeg))
  for (const child of [...targetScene.listChildren()]) {
    root.addChild(child)
  }
  scene.addChild(root)
}

// --- Ground floor: two 2x2 tiles along Z, open doorway facing -Z ---
await place('floor.glb', [0, 0, -1])
await place('floor.glb', [0, 0, 1])
await place('wall.glb', [-1, 0, -1]) // west
await place('wall.glb', [-1, 0, 1])
await place('wall.glb', [1, 0, -1]) // east
await place('wall.glb', [1, 0, 1])
await place('wall-doorway-square.glb', [0, 0, -2], 90) // front, open bay door
await place('wall.glb', [0, 0, 2], 90) // back

// --- Second floor: windows all around ---
const L2 = 2.4
await place('wall-window-square.glb', [-1, L2, -1])
await place('wall-window-square.glb', [-1, L2, 1])
await place('wall-window-square.glb', [1, L2, -1])
await place('wall-window-square.glb', [1, L2, 1])
await place('wall-window-square.glb', [0, L2, -2], 90)
await place('wall.glb', [0, L2, 2], 90)

// --- Roof + vent detail ---
const ROOF = 4.8
await place('roof-flat-square.glb', [0, ROOF, -1])
await place('roof-flat-square.glb', [0, ROOF, 1])
await place('detail-pipe.glb', [0.7, ROOF + 0.4, 0.7])

await target.transform(dedup(), unpartition())

await io.write(OUT, target)
console.log('wrote (uncompressed merge)', OUT, '— run gltf-pipeline separately for Draco')
