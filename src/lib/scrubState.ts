/** Share scrub coordinates between the canvas and DOM without React updates on every frame. */
export const scrubState = {
  currentU: 0,
  requestedU: null as number | null,
}
