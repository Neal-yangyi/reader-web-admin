import request from '../utils/request'

export function addNotice(data) {
  return request({
    url: '/admin/addNotice',
    method: 'post',
    data
  })
}

export function fetchList(pageNum, pageSize, order) {
  return request({
    url: '/admin/noticeList',
    method: 'get',
    params: {
      pageNum: pageNum,
      pageSize: pageSize,
      order: order
    }
  })
}

export function updateNotice(data) {
  return request({
    url: '/admin/updateNotice',
    method: 'post',
    data
  })
}

export function deleteNotice(id) {
  return request({
    url: '/admin/deleteNotice',
    method: 'delete',
    params: {
      id: id
    }
  })
}
