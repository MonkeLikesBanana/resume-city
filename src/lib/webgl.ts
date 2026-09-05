/** PRD §10/§6 — detect WebGL2 support before ever mounting the R3F
 * <Canvas>. If this is false, the 3D scene never attempts to render at all
 * — NoWebGLFallback takes over instead. */
export function isWebGL2Supported(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!canvas.getContext('webgl2')
  } catch {
    return false
  }
}
