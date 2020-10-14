import request from '@/utils/request'

export function getPage(data) {
  return request({
    url: '/port/getPage',
    method: 'post',
    data
  })
}

export function getPortList(data) {
  return request({
    url: '/port/getPortList',
    method: 'post',
    data
  })
}

export function deletePort(data) {
  return request({
    url: '/port/delete',
    method: 'get',
    params: data
  })
}

export function savePort(data) {
  return request({
    url: '/port/save',
    method: 'post',
    data
  })
}

export function batchSavePort(data) {
  return request({
    url: '/port/batchSave',
    method: 'post',
    data
  })
}
