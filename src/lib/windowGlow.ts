import * as THREE from 'three'

/** PRD v4 §7.4 — building windows glow at night via a single shared-material
 * change, not a light per window. Kenney GLBs share ONE material instance
 * across every mesh *within a file* (confirmed in v2/v3 QA — e.g. one
 * "colormap" material used dozens of times), but each separately-loaded GLB
 * gets its OWN material instances — useGLTF caches per URL, it doesn't merge
 * materials across different files. So "every building's windows light up"
 * needs a small runtime registry: any building mesh's material (Building.tsx
 * and InstancedBuildings.tsx register these on load, opt-in only — see each
 * for why) gets tracked here, and DayNightCycle flips them all together,
 * once, each frame.
 *
 * Auditing every attraction/filler model (scripts/_tmp-list-materials.mjs,
 * v4 polish round 3) found the original assumption wrong: only
 * robotics-workshop.glb has an actual separate "glass" material — every
 * other building (all 9 remaining attraction models, all ~19 filler models)
 * is a single mesh with ONE "colormap" material covering walls, roof, AND
 * windows together. There's no window-only surface to isolate for those, so
 * they get a second, much subtler tier: a small uniform warm lift across the
 * whole material rather than a bright tinted glow — reads as ambient
 * interior/street light bouncing off the facade rather than a literal lit
 * window, without making entire buildings look like lightbulbs. */
const glassMaterials = new Set<THREE.MeshStandardMaterial>()
const bodyMaterials = new Set<THREE.MeshStandardMaterial>()

export function registerGlowMaterial(material: THREE.Material) {
  if (!(material instanceof THREE.MeshStandardMaterial)) return
  if (/glass/i.test(material.name)) glassMaterials.add(material)
  else bodyMaterials.add(material)
}

const _glowColor = new THREE.Color('#ffcf8a')
const GLASS_INTENSITY = 1.4
const BODY_INTENSITY = 0.3

export function setWindowGlow(isNight: boolean) {
  const glassTarget = isNight ? GLASS_INTENSITY : 0
  glassMaterials.forEach((mat) => {
    if (mat.emissiveIntensity === glassTarget) return
    mat.emissive.copy(_glowColor)
    mat.emissiveIntensity = glassTarget
  })
  const bodyTarget = isNight ? BODY_INTENSITY : 0
  bodyMaterials.forEach((mat) => {
    if (mat.emissiveIntensity === bodyTarget) return
    mat.emissive.copy(_glowColor)
    mat.emissiveIntensity = bodyTarget
  })
}
