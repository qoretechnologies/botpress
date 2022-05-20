const axios = require('axios')
/**
 * @hidden true
 */

const callApi = async (url, method, body, memory, variable, headers) => {
  // Use context to flatten event object
  const context = {
    event,
    user: event.state.user,
    temp: event.state.temp,
    session: event.state.session
  }
  const renderedHeaders = bp.cms.renderTemplate(headers, context)
  let renderedBody = bp.cms.renderTemplate(body, context)
  const keySuffix = args.randomId ? `_${args.randomId}` : ''

  // this just slaps in the context object
  renderedBody.context = context

  try {
    console.log('memory, variable', memory, variable)
    console.log(`Calling ${url} with ${method} and content: ${renderedBody}`)
    const response = await axios({
      method,
      url,
      headers: renderedHeaders,
      data: renderedBody
    })

    console.log('event', event)
    console.log('memory', memory)
    console.log('variable', variable)

    event.state[memory][variable] = { body: response.data, status: response.status }
    event.state.temp[`valid${keySuffix}`] = true
  } catch (error) {
    console.log('calling API ERROR', error)
    const errorCode = (error.response && error.response.status) || error.code || ''
    bp.logger.error(`Error: ${errorCode} while calling resource "${url}"`)

    event.state[memory][variable] = { status: errorCode }
    event.state.temp[`valid${keySuffix}`] = false
  }
}

return callApi(args.url, args.method, args.body, args.memory, args.variable, args.headers)
