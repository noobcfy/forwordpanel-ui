import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/authToken',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

export function getPage(data) {
  return request({
    url: '/user/getPage',
    method: 'post',
    data
  })
}

export function getUserPortList(data) {
  return request({
    url: '/userport/getList',
    method: 'get',
    params: data
  })
}

export function getFreePortList(data) {
  return request({
    url: '/port/getFreePortList',
    method: 'get',
    params: data
  })
}

export function saveUserPorts(data) {
  return request({
    url: '/userport/save',
    method: 'post',
    data
  })
}

export function deleteData(data) {
  return request({
    url: '/user/delete',
    method: 'get',
    params: data
  })
}

export function resetFlow(data) {
  return request({
    url: '/user/resetFlow',
    method: 'get',
    params: data
  })
}

export function deleteUserPort(data) {
  return request({
    url: '/userport/delete',
    method: 'get',
    params: data
  })
}

export function resetPwd(data) {
  return request({
    url: '/user/setPwd',
    method: 'get',
    params: data
  })
}

export function disableUser(data) {
  return request({
    url: '/user/disable',
    method: 'get',
    params: data
  })
}

export function enableUser(data) {
  return request({
    url: '/user/enable',
    method: 'get',
    params: data
  })
}

export function disableUserPort(data) {
  return request({
    url: '/userport/disable',
    method: 'get',
    params: data
  })
}

export function enableUserPort(data) {
  return request({
    url: '/userport/enable',
    method: 'get',
    params: data
  })
}

export function save(data) {
  return request({
    url: '/user/save',
    method: 'post',
    data
  })
}
