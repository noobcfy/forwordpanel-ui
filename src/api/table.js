import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/forwardpanel-ui/table/list',
    method: 'get',
    params
  })
}
