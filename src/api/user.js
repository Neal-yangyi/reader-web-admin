import request from '@/utils/request'

export function fetchList(detail, pageNum, pageSize) {
  return request({
    url: '/admin/userList',
    method: 'get',
    params: {
      username: detail.username,
      sex: detail.sex,
      phone: detail.phone,
      pageNum: pageNum,
      pageSize: pageSize
    }
  })
}

