export function sessionKey() {
  let key = sessionStorage.getItem('session_key')
  if (!key) {
    key = 'guest_' + Math.random().toString(36).slice(2)
    sessionStorage.setItem('session_key', key)
  }
  return key
}