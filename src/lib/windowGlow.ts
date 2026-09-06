import * as THREE from 'three'

/** PRD v4 §7.4 — building windows glow at night via a single shared-material
 * change, not a light per window. Kenney GLBs share ONE material instance
 * across every mesh *within a file* (confirmed in v2/v3 QA — e.g. one
 * "colormap" material used dozens of times), but each separately-loaded GLB
 * gets its OWN material instances — useGLTF caches per URL, it doesn't merge
 * materials across different files. So "every building's windows light up"
 * needs a small runtime registry: any mesh whose material is actually named
 * like a glass surface (Building.tsx registers these on load) gets tracked
 * here, and DayNightCycle flips all of them together, once, each frame. Only
 * models with a genuine separate glass material register anything — the
 * single-mesh filler/suburb buildings (verified via inspect-compressed.mjs
 * to have exactly one merged mesh each) have no distinct window surface to
 * glow, and are silently skipped, not broken. */
const glowMaterials = new Set<THREE.MeshStandardMaterial>()

export function registerGlowMaterial(material: THREE.Material) {
  if (!(material instanceof THREE.MeshStandardMaterial)) return
  if (!/glass/i.test(material.name)) return
  glowMaterials.add(material)
}

const _glowColor = new THREE.Color('#ffcf8a')

export function setWindowGlow(isNight: boolean) {
  const intensity = isNight ? 1.4 : 0
  glowMaterials.forEach((mat) => {
    if (mat.emissiveIntensity === intensity) return
    mat.emissive.copy(_glowColor)
    mat.emissiveIntensity = intensity
  })
}
