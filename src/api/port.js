import request from '@/utils/request'

export function getPage(data) {
  return request({
    url: '/port/getPage',
    method: 'post',
    data
  })
}

export function deleteData(data) {
  return request({
    url: '/port/delete',
    method: 'get',
    params: data
  })
}

export function save(data) {
  return request({
    url: '/port/save',
    method: 'post',
    data
  })
}
