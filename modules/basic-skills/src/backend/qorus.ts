import * as sdk from 'botpress/sdk'
import { omit, reduce } from 'lodash'
import { getUrl } from './utils'

const generateFlow = async (data: any, metadata: sdk.FlowGeneratorMetadata): Promise<sdk.FlowGenerationResult> => {
  return {
    transitions: createTransitions(data),
    flow: {
      nodes: createNodes(data),
      catchAll: {
        next: []
      }
    }
  }
}

const createNodes = (data) => {
  /* It's a way to flatten the args object. */
  if (data?.provider?.args?.value) {
    data.provider.args = reduce(
      data.provider.args.value,
      (acc, val, key) => {
        return { ...acc, [key]: val }
      },
      {}
    )
  }

  const skillTypeToUrl = {
    apicall: 'callApiFromUi',
    search: 'searchRecordsFromUi',
    create: 'createRecordsFromUi',
    update: 'updateRecordsFromUi',
    delete: 'deleteRecordsFromUi'
  }

  const nodes: sdk.SkillFlowNode[] = [
    {
      name: 'entry',
      onEnter: [
        {
          type: sdk.NodeActionType.RunAction,
          name: 'basic-skills/call_api',
          args: {
            url: `${getUrl()}dataprovider/${skillTypeToUrl[data.skillType]}`,
            method: 'POST',
            randomId: data.randomId,
            /* A way to pass data to the action. */
            body: omit(data.provider, ['is_api_call', 'desc', 'use_args', 'supports_request']),
            headers: {
              Accept: 'application/json',
              Authorization: `Basic ${Buffer.from('fwitosz:fwitosz42').toString('base64')}`
            }
          }
        }
      ],
      next: [{ condition: 'true', node: '#' }]
    }
  ]
  return nodes
}

const createTransitions = (data): sdk.NodeTransition[] => {
  const keySuffix = data.randomId ? `_${data.randomId}` : ''

  return [
    { caption: 'On success', condition: `temp.valid${keySuffix}`, node: '' },
    { caption: 'On failure', condition: `!temp.valid${keySuffix}`, node: '' }
  ]
}

export default { generateFlow }
