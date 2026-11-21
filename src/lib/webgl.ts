/** Check WebGL2 before mounting the canvas so unsupported devices keep the same readable story. */
export function isWebGL2Supported(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2')
    context?.getExtension('WEBGL_lose_context')?.loseContext()
    return Boolean(context)
  } catch {
    return false
  }
}
