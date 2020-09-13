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

export function deleteData(data) {
  return request({
    url: '/user/delete',
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
