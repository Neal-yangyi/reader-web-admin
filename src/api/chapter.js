import request from '@/utils/request'

export function fetchList(detail, pageNum, pageSize) {
  return request({
    url: '/admin/chapterList',
    method: 'get',
    params: {
      title: detail.title,
      username: detail.username,
      allow: detail.allow,
      pageNum: pageNum,
      pageSize: pageSize
    }
  })
}

export function auditChapter(cid, allow) {
  return request({
    url: '/admin/auditChapter',
    method: 'get',
    params: {
      cid: cid,
      allow: allow
    }
  })
}
