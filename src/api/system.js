import request from '@/utils/request'
import FormData from 'form-data'

export function exportData(data) {
  return request({
    url: '/system/exportData',
    method: 'get',
    params: data
  })
}

/**
 * 文件上传
 */
export function importData(fileobj) {
  const param = new FormData()
  param.append('file', fileobj.file)
  return request({
    method: 'post',
    url: '/system/importData',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: param
  })
}

