/** Check WebGL2 before mounting the canvas so unsupported devices get the text résumé. */
export function isWebGL2Supported(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!canvas.getContext('webgl2')
  } catch {
    return false
  }
}
