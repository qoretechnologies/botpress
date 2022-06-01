import { getUrl } from '../../../backend/utils'

export const fetchData = async (
  url: string,
  method: 'GET' | 'POST' | 'PUT' = 'GET'
): Promise<{ data?: any; error?: string }> => {
  console.log(window)

  const realUrl = `${getUrl()}${url}`

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

export const insertAtIndex = (array: any[] = [], index = 0, value) => {
  return [...array.slice(0, index), value, ...array.slice(index)]
}
