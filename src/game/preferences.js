export function toggleMutePreference(state) {
  state.muted = !state.muted;
  return state.muted;
}
