import * as sdk from 'botpress/sdk'

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
  console.log('CREATE_NODES_DATA', data)
  const nodes: sdk.SkillFlowNode[] = [
    {
      name: 'entry',
      onEnter: [
        {
          type: sdk.NodeActionType.RunAction,
          name: 'basic-skills/qorus',
          args: {
            randomId: data.randomId,
            url: data.url,
            method: data.method,
            body: data.body,
            headers: data.headers,
            memory: data.memory,
            variable: data.variable
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
    { caption: 'On successdfsdf', condition: `temp.valid${keySuffix}`, node: '' },
    { caption: 'On failure', condition: `!temp.valid${keySuffix}`, node: '' }
  ]
}

export default { generateFlow }
