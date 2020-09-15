import request from '@/utils/request'

export function getPage(data) {
  return request({
    url: '/forward/getPage',
    method: 'post',
    data
  })
}

export function deleteData(data) {
  return request({
    url: '/forward/delete',
    method: 'get',
    params: data
  })
}

export function start(data) {
  return request({
    url: '/forward/start',
    method: 'post',
    data
  })
}

export function stopForward(data) {
  return request({
    url: '/forward/stop',
    method: 'post',
    data
  })
}
