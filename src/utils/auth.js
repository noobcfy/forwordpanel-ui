import Cookies from 'js-cookie'

const TokenKey = 'forward_panel_token'
const CUKey = 'cu'
const CUIDKey = 'cuid'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getCurrentUser() {
  const cuJSON = Cookies.get(CUKey)
  console.log('cuJson>>>', cuJSON)
  return typeof(cuJSON) === 'undefined' ? {} : JSON.parse(cuJSON)
}

export function setCurrentUser(cu) {
  console.log(cu)
  Cookies.set(CUKey, JSON.stringify(cu))
  return Cookies.set(CUIDKey, cu.userId)
}

export function removeCurrentUser() {
  Cookies.remove(CUIDKey)
  return Cookies.remove(CUKey)
}

export function getCUID() {
  return Cookies.get(CUIDKey)
}
