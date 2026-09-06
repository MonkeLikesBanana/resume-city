import DownloadResumeButton from './DownloadResumeButton'
import AccessibleNav from './AccessibleNav'
import { CITY_NAME } from '../../config'

/** PRD §10/§6/§13 Phase 6 — "the resume is never unreachable because a
 * GPU/driver/browser combination didn't cooperate." Rendered instead of the
 * 3D scene when WebGL2 isn't supported, or after the canvas reports a
 * webglcontextlost it can't recover from. Static og-image + the same real
 * nav links + PDF — no reduced feature set beyond "no camera drives." */
export default function NoWebGLFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto bg-[var(--color-ground)] px-6 py-10 text-center">
      <img
        src="/og-image.png"
        alt={`An illustrated overview of ${CITY_NAME}, a small city representing Aarav Vaswani's résumé`}
        className="w-full max-w-2xl rounded-xl border border-[var(--color-ink)]/10 shadow-lg"
      />
      <h1 className="mt-6 font-[Fredoka] text-3xl font-semibold text-[var(--color-ink)]">{CITY_NAME}</h1>
      <p className="mt-2 max-w-md text-sm text-[var(--color-ink)]/70">
        This browser or device can't run the interactive 3D scene, but every stop is still right here.
      </p>

      <div className="mt-6">
        <DownloadResumeButton />
      </div>

      <div className="mt-8 w-full max-w-md text-left">
        <p className="mb-2 px-1 text-[11px] font-semibold tracking-wide text-[var(--color-ink)]/70 uppercase">
          Every stop
        </p>
        <div className="rounded-xl border border-[var(--color-ink)]/10 bg-white/60 p-2">
          <AccessibleNav forceOpen />
        </div>
      </div>
    </div>
  )
}
