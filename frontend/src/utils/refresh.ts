const DATA_REFRESH_EVENT = 'bierlog-data-refresh'
const DATA_REFRESH_STORAGE_KEY = 'bierlog.data.refresh'

export const Refresh = {
  event: DATA_REFRESH_EVENT,
  storageKey: DATA_REFRESH_STORAGE_KEY,
  trigger() {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(DATA_REFRESH_STORAGE_KEY, String(Date.now()))
    window.dispatchEvent(new Event(DATA_REFRESH_EVENT))
  },
}
