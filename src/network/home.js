import {request} from "./request"

export function getHomeMultidate() {
  return request({
    url: '/home/multidata'
  }).catch(err => err);
}

export function getHomeGoods(type, page) {
  return request({
    url: '/home/data',
    params: {
      type,
      page
    }
  }).catch(err => err);
}
