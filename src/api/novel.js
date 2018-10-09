import request from '@/utils/request'

export function fetchList(detail, pageNum, pageSize) {
  return request({
    url: '/admin/novelList',
    method: 'get',
    params: {
      title: detail.title,
      state: detail.state,
      lid: detail.lid,
      username: detail.username,
      allow: detail.allow,
      pageNum: pageNum,
      pageSize: pageSize
    }
  })
}

export function auditNovel(nid, allow) {
  return request({
    url: '/admin/auditNovel',
    method: 'get',
    params: {
      nid: nid,
      allow: allow
    }
  })
}
