import request from '@/utils/request'

export function getPage(data) {
  return request({
    url: '/config/getPage',
    method: 'post',
    data
  })
}

export function deleteData(data) {
  return request({
    url: '/config/delete',
    method: 'get',
    params: data
  })
}

export function save(data) {
  return request({
    url: '/config/save',
    method: 'post',
    data
  })
}

export function getNodeList(data) {
  return request({
    url: '/config/getNodeList',
    method: 'get',
    params: data
  })
}

export function saveNodeList(data, param) {
  return request({
    url: '/config/saveNodeList',
    method: 'post',
    params: param,
    data
  })
}
