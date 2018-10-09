import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
const usernameKey = 'username'
const uidKey = 'uid'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getUsername() {
  return Cookies.get(usernameKey)
}

export function setUsername(username) {
  return Cookies.set(usernameKey, username)
}

export function removeUsername() {
  return Cookies.remove(usernameKey)
}

export function getUid() {
  return Cookies.get(uidKey)
}

export function setUid(uid) {
  return Cookies.set(uidKey, uid)
}

export function removeUid() {
  return Cookies.remove(uidKey)
}
