export const fetchData = async (
  url: string,
  method: 'GET' | 'POST' | 'PUT' = 'GET'
): Promise<{ data?: any; error?: string }> => {
  const realUrl = `${window.location.protocol}://hq.qoretechnologies.com:${
    window.location.protocol === 'https' ? '8092' : '8091'
  }/api/latest/${url}`

  try {
    const res = await fetch(realUrl, {
      method: method,
      headers: {
        Authorization: 'Basic ' + btoa('fwitosz:fwitosz42')
      }
    })

    if (res.status === 200) {
      const data = await res.json()
      return { data }
    }

    const data = await res.text()

    return { error: data }
  } catch (e) {
    return { error: e }
  }
}
