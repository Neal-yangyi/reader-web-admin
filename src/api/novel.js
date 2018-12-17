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

export function findById(id) {
  return request({
    url: '/novel/' + id,
    method: 'get'
  })
}

export function select(query) {
  return request({
    url: '/novel/select',
    method: 'get',
    params: {
      lid: query.lid,
      state: query.state,
      constraint: query.constraint
    }
  })
}
