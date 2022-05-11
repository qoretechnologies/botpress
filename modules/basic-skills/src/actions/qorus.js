const axios = require('axios')
const { reduce, isNumber, isString, isNull, isUndefined } = require('lodash')
const jsyaml = require('js-yaml')
/**
 * @hidden true
 */

const maybeParseYaml = (yaml) => {
  // If we are dealing with basic boolean
  if (yaml === true || yaml === false) {
    return yaml
  }
  // Leave numbers as they are
  if (isNumber(yaml)) {
    return yaml
  }

  // Check if the value isn't empty
  if (yaml === undefined || yaml === null || yaml === '' || !isString(yaml)) {
    return null
  }
  // Parse the string as yaml
  let yamlCorrect = true
  let parsedData
  // Parse the yaml
  try {
    parsedData = jsyaml.safeLoad(String(yaml))
  } catch (e) {
    yamlCorrect = false
  }

  if (!yamlCorrect) {
    return null
  }

  if (!isNull(parsedData) && !isUndefined(parsedData)) {
    return parsedData
  }

  return null
}

const callApi = async (url, method, body, memory, variable, headers) => {
  console.log(event.state.session)
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

  /* It's a way to flatten the args object. */
  renderedBody.args = reduce(
    renderedBody.args.value,
    (acc, val, key) => {
      return { ...acc, [key]: val }
    },
    {}
  )

  delete renderedBody.is_api_call
  delete renderedBody.desc
  delete renderedBody.supports_request
  delete renderedBody.use_args

  try {
    const response = await axios({
      method,
      url,
      headers: renderedHeaders,
      data: renderedBody
    })

    //console.log('response', response)

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

return callApi(
  'http://hq.qoretechnologies.com:8091/api/latest/dataprovider/callApi',
  'POST',
  args.provider,
  'temp',
  'response',
  {
    Accept: 'application/json',
    Authorization: `Basic ${Buffer.from('fwitosz:fwitosz42').toString('base64')}`
  }
)
