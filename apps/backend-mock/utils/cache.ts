import Cookies from 'js-cookie'

const cookiesCache = {
  set(key: string | null, value: string | null) {
    if (!Cookies)
      return
    if (key != null && value != null)
      Cookies.set(key, value)
  },
  get(key: string | null) {
    if (!Cookies)
      return null

    if (key == null)
      return null

    return Cookies.get(key)
  },
  setJSON(key: string | null, jsonValue: object) {
    if (jsonValue != null)
      this.set(key, JSON.stringify(jsonValue))
  },
  getJSON(key: string | null) {
    const value = this.get(key)
    if (value != null)
      return JSON.parse(value)

    return null
  },
  setToken(key: string, value: string) {
    if (value != null)
      this.set(key, value)
  },
  getToken(key: string) {
    const value = this.get(key)
    if (value != null)
      return value

    return ''
  },
  remove(key: string) {
    Cookies.remove(key)
  },
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  /**
   * 会话级缓存
   */
  cookies: cookiesCache,
}
