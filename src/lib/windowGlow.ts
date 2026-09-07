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
 * windows together, so there's no separate mesh/material to target with a
 * uniform emissive toggle the way robotics-workshop's real glass gets.
 *
 * Round 4 fix: these "colormap" materials are Kenney's usual flat-swatch
 * atlas (confirmed by extracting the actual embedded texture — it's a grid
 * of solid color blocks, not a photo), and window faces use a distinctly,
 * strongly blue-dominant swatch. First calibration attempt sampled a *lit*
 * screenshot and mistook the window's dark frame/trim outline for the
 * window itself (~rgb(22,38,55) — actually just a dark navy trim color that
 * turned out to also match plenty of non-window trim, which is why the
 * first threshold lit up whole walls instead of windows). Fixed by
 * bypassing lighting entirely (a temporary `gl_FragColor = diffuseColor`
 * override, then `gl_FragColor = vec3(windowMask)`) to see the *raw* per-
 * pixel diffuse color and mask output directly — the actual window glass is
 * a saturated blue (~rgb(60,105,198) on screen), a full order of magnitude
 * more blue-biased than any wall/trim swatch (~7-22 vs ~93 in blue-minus-
 * max(red,green), 0-255 terms). That gap is what the shader thresholds on:
 * sample the material's own diffuse color per-pixel in a small
 * onBeforeCompile injection and only add emissive where blue clearly wins,
 * so window *sections* light up rather than the whole building. No offline
 * texture editing, no extra geometry — the shader reads the same
 * diffuseColor the material already computed for its normal shading. */
const glassMaterials = new Set<THREE.MeshStandardMaterial>()
const bodyMaterials = new Set<THREE.MeshStandardMaterial>()

interface GlowShader {
  uniforms: { uNightGlow: { value: number } }
}

function injectWindowMaskShader(material: THREE.MeshStandardMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uNightGlow = { value: 0 }
    material.userData.glowShader = shader as unknown as GlowShader
    shader.fragmentShader =
      'uniform float uNightGlow;\n' +
      shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        {
          float windowDiff = diffuseColor.b - max( diffuseColor.r, diffuseColor.g );
          float windowMask = smoothstep( 0.15, 0.3, windowDiff );
          totalEmissiveRadiance += vec3( 1.0, 0.72, 0.42 ) * windowMask * uNightGlow;
        }`,
      )
  }
  material.needsUpdate = true
}

export function registerGlowMaterial(material: THREE.Material) {
  if (!(material instanceof THREE.MeshStandardMaterial)) return
  if (/glass/i.test(material.name)) {
    glassMaterials.add(material)
    return
  }
  if (bodyMaterials.has(material)) return
  bodyMaterials.add(material)
  injectWindowMaskShader(material)
}

const _glowColor = new THREE.Color('#ffcf8a')
const GLASS_INTENSITY = 1.4
const BODY_GLOW_INTENSITY = 3.2 // feeds the shader's uNightGlow uniform, not material.emissiveIntensity — a different scale, tuned by eye against the window mask

export function setWindowGlow(isNight: boolean) {
  const glassTarget = isNight ? GLASS_INTENSITY : 0
  glassMaterials.forEach((mat) => {
    if (mat.emissiveIntensity === glassTarget) return
    mat.emissive.copy(_glowColor)
    mat.emissiveIntensity = glassTarget
  })
  const bodyTarget = isNight ? BODY_GLOW_INTENSITY : 0
  bodyMaterials.forEach((mat) => {
    const shader = mat.userData.glowShader as GlowShader | undefined
    if (shader) shader.uniforms.uNightGlow.value = bodyTarget
  })
}
