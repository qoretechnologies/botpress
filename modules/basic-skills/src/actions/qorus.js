/** @ignore
 * @var temp
 * @var user
 *
 * ----------------------------
 * ---- Creating an Action ----
 * ----------------------------
 *
 * -- STORAGE --
 * In the global scope you have access to the following storage objects:
 * @var temp     Temporary flow-level storage.  Unique to every flow execution.  Ideal for logic implementation such as data returned from APIs.
 * @var user     Permanent user-level storage.  Unique to every users.  Ideal for remembering things specific to a user such as email, name, customerId, etc.
 * @var session  Temporary session-level storage.  Unique to every dialog sessions, which is time-bound (defaults to 15 minutes).  Ideal for remembering things specific to a conversation.
 *
 * -- CONTEXT --
 * In the global scope you have access to the @var event variable.
 *
 * -- PARAMETERS --
 * In the global scope you have access to the @var args object.
 * The @var args object is a key-value-pair of parameters defined when calling the action from the Flow Editor.
 *
 * -- ASYNC --
 * Actions can run asynchronously by returning a Promise.  If you want to use the `await` keyword, you need to declare an async function
 * and return a call to that function. @file `./builtin/getGlobalVariable.js` for a concrete example.
 *
 * -- REQUIRE MODULES --
 * You can require external modules by using `require('module-name')`.  A `node_modules` directory needs to be present next to the action
 * and the dependency needs to be present in this directory.  You can use npm/yarn inside the actions directory to manage dependencies.
 * Some modules are available by default such as axios and lodash
 *
 * -- REQUIRE FILES --
 * You can require adjacent .js and .json files, simply use `require('./path_to_file.js')`.  If the adjacent file is a .js file and is not intended to be an action in itself,
 * consider prefixing the file with a dot (.) so Botpress ignores it when looking for actions.
 *
 * -- METADATA --
 * You can change how the action will be presented in the Flow Editor by using JSDoc comments.  See example at the top of the file.
 */

const util = require('util')
const axios = require('axios')

console.log('Arguments =', util.inspect(args, false, 2, true))
console.log('Event =', util.inspect(event, false, 2, true))

const callQorusAPI = async () => {
  const { url, method, body, memory, variable, headers } = args
  // Use context to flatten event object
  const context = {
    event,
    user: event.state.user,
    temp: event.state.temp,
    session: event.state.session
  }
  const renderedHeaders = bp.cms.renderTemplate(headers, context)
  const renderedBody = bp.cms.renderTemplate(body, context)
  const keySuffix = args.randomId ? `_${args.randomId}` : ''

  try {
    console.log('memory, variable', memory, variable)
    console.log(`Calling ${url} with ${method} and content: ${renderedBody}`)
    const response = await axios({
      method,
      url,
      headers: renderedHeaders,
      data: renderedBody
    })

    console.log('response', response)

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
return callQorusAPI()
