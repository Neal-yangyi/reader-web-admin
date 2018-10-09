import request from '../utils/request'

export function sendMessage(detail) {
  const data = {
    title: detail.title,
    fromId: detail.fromId,
    toId: detail.toId,
    content: detail.content,
    isRead: 0,
    type: 0
  }
  return request({
    url: '/admin/sendMessage',
    method: 'post',
    data: data
  })
}
