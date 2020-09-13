import request from '@/utils/request'

export function getMenus(data) {
  return request({
    url: '/getMenus',
    method: 'get',
    data
  })
}
