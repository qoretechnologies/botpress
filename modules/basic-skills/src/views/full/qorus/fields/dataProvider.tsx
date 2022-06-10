import { setupPreviews } from '@previewjs/plugin-react/setup'
import { ReqoreMessage, ReqorePanel } from '@qoretechnologies/reqore'
import { capitalize, cloneDeep, isEqual, map, reduce } from 'lodash'
import size from 'lodash/size'
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useDebounce } from 'react-use'
import Spacer from '../components/Spacer'
import { ApiCallArgs } from './apiCallArgs'
import Provider, { providers } from './provider'
import { RecordQueryArgs } from './searchArgs'
import Options, { IOptions } from './systemOptions'

export type TRecordType = 'search' | 'search-single' | 'create' | 'update' | 'delete'
export type TRealRecordType = 'read' | 'create' | 'update' | 'delete'

export interface IConnectorFieldProps {
  title?: string
  onChange?: (name: string, data: IProviderType | string) => void
  name: string
  value: IProviderType | string
  inline?: boolean
  providerType?: 'inputs' | 'outputs' | 'event' | 'input-output' | 'condition'
  requiresRequest?: boolean
  minimal?: boolean
  isConfigItem?: boolean
  recordType?: TRecordType
}

export type TProviderTypeSupports = {
  [key in `supports_${TRealRecordType}`]?: boolean
}

export type TProviderTypeArgs = {
  [key in `${TRecordType}_args`]?: IOptions | IOptions[]
}

export interface IProviderType extends TProviderTypeArgs, TProviderTypeSupports {
  type: string
  name: string
  path?: string
  options?: IOptions
  hasApiContext?: boolean
  optionsChanged?: boolean
  desc?: string
  use_args?: boolean
  args?: any
  supports_request?: boolean
  is_api_call?: boolean
  search_options?: IOptions
}

const supportsList = {
  create: true
}

const supportsOperators = {
  search: true,
  'search-single': true
}

const supportsArguments = {
  create: true,
  update: true
}

const getRealRecordType = (recordType: TRecordType): TRealRecordType => {
  return recordType.startsWith('search') ? 'read' : (recordType as TRealRecordType)
}

const shouldShowSearchArguments = (recordType: TRecordType, optionProvider: IProviderType | null): boolean => {
  const realRecordType = recordType.startsWith('search') ? 'read' : recordType

  if (['read', 'update', 'delete'].includes(realRecordType) && optionProvider?.[`supports_${realRecordType}`]) {
    return true
  }

  return false
}

export const getUrlFromProvider: (val: IProviderType | string, withOptions?: boolean, isRecord?: boolean) => string = (
  val,
  withOptions,
  isRecord
) => {
  // If the val is a string, return it
  if (typeof val === 'string') {
    return val
  }
  const { type, name, path = '', options, is_api_call, hasApiContext } = val
  let optionString

  if (size(options)) {
    // Build the option string for URL
    optionString = `provider_yaml_options={${map(
      options,
      (value, key) => `${key}=${btoa(value?.value || value || '')}`
    ).join(',')}}`
  }
  // Get the rules for the given provider
  const { url, suffix, recordSuffix, suffixRequiresOptions } = providers[type]

  if (withOptions) {
    return `${url}/${name}/${type === 'factory' ? 'provider_info/' : ''}constructor_options?context=ui${
      hasApiContext ? '&context=api' : ''
    }`
  }

  // Check if the path ends in /request or /response
  const endsInSubtype = path.endsWith('/request') || path.endsWith('/response')

  // Build the suffix
  const realPath = `${suffix}${path}${endsInSubtype || is_api_call || isRecord ? '' : recordSuffix || ''}${
    withOptions ? '/constructor_options' : ''
  }`

  const suffixString = suffixRequiresOptions
    ? optionString && optionString !== ''
      ? `${realPath}?${optionString}`
      : `${withOptions ? '/constructor_options' : `${realPath}`}`
    : realPath

  // Build the URL based on the provider type
  return `${url}/${name}${suffixString}${type === 'type' && endsInSubtype ? '?action=type' : ''}`
}

export const maybeBuildOptionProvider = (provider: IProviderType | string): IProviderType | null => {
  if (!provider) {
    return null
  }

  // If the provider is an object, return it
  if (typeof provider === 'object') {
    return provider
  }
  // Check if the provider is a factory
  if (provider.startsWith('factory')) {
    // Get everything between the < and >
    //const factory = provider.substring(provider.indexOf('<') + 1, provider.indexOf('>'));
    // Get the factory name
    const [factoryType, nameWithOptions]: string[] = provider.split('/')
    // Get everything between the first / and { bracket
    const [factoryName] = nameWithOptions.split('{')
    // Get everything in the provider between first { and last }, which are the options
    const options = nameWithOptions.substring(nameWithOptions.indexOf('{') + 1, nameWithOptions.lastIndexOf('}'))
    // Split the options by comma
    const optionsArray = options.split(',')
    let optionsObject = {}
    if (size(optionsArray)) {
      // Map through all the options and split each by =, which is the key and value
      optionsObject = reduce(
        optionsArray,
        (newOptions, option) => {
          const [key, value] = option.split('=')
          return { ...newOptions, [key]: value }
        },
        {}
      )
    }
    // Return the new provider
    return {
      type: factoryType,
      name: factoryName,
      // Get everything after the last }/ from the provider
      path: provider.substring(provider.lastIndexOf('}/') + 2),
      options: optionsObject,
      // Add the optionsChanged key if the provider includes the "?options_changed" string
      optionsChanged: (provider as string).includes('?options_changed')
    } as IProviderType
  }
  // split the provider by /
  const [type, name, ...path] = provider.split('/')
  // Return it
  return {
    type,
    name,
    path: path.join('/')
  } as IProviderType
}

export const t = (str) => str

const ConnectorField: React.FC<IConnectorFieldProps> = ({
  title,
  onChange,
  name,
  value,
  inline,
  providerType,
  minimal,
  isConfigItem,
  requiresRequest,
  recordType
}) => {
  const [optionProvider, setOptionProvider] = useState<IProviderType | null>(maybeBuildOptionProvider(value))
  const [nodes, setChildren] = useState(
    optionProvider
      ? [
          {
            value: optionProvider.name,
            values: [
              {
                name: optionProvider.name,
                url: providers[optionProvider.type].url,
                suffix: providers[optionProvider.type].suffix
              }
            ]
          },
          ...(optionProvider.path
            ? optionProvider?.path
                .split('/')
                .map((item) => ({ value: item, values: [{ name: item }] }))
                .filter((predicate) => predicate && predicate.value !== '')
            : [])
        ]
      : []
  )
  const [provider, setProvider] = useState(optionProvider?.type)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const clear = () => {
    setIsEditing(false)
    setOptionProvider(null)
  }

  const reset = () => {
    setChildren([])
    setProvider(null)
    setOptionProvider(null)
    setIsLoading(false)
    onChange?.(name, undefined)
  }

  useDebounce(
    () => {
      if (!isEditing) {
        if (!optionProvider) {
          onChange?.(name, undefined)
          return
        }

        const val = { ...optionProvider }

        if (val.type !== 'factory') {
          delete val.optionsChanged
          delete val.options
        }

        if (isConfigItem) {
          // Add type from optionProvider and get value from all nodes and join them by /
          const type = val.type
          const newNodes = cloneDeep(nodes)

          if (type === 'factory') {
            let options = reduce(
              val.options,
              (newOptions, optionData, optionName) => {
                return `${newOptions}${optionName}=${optionData.value},`
              },
              ''
            )
            // Remove the last comma from options
            options = options.substring(0, options.length - 1)

            if (newNodes[0]) {
              newNodes[0].value = `${newNodes[0].value}{${options}}`
            }

            const value = newNodes.map((node) => node.value).join('/')

            onChange?.(name, `${type}/${value}${val.optionsChanged ? `?options_changed` : ''}`)
          } else {
            const value = nodes.map((node) => node.value).join('/')
            onChange?.(name, `${type}/${value}`)
          }
        } else {
          onChange?.(name, val)
        }
      }
    },
    30,
    [JSON.stringify(optionProvider), isEditing]
  )

  return (
    <div>
      <ReqorePanel collapsible padded label="Select data provider" rounded>
        <Provider
          isConfigItem={isConfigItem}
          nodes={nodes}
          setChildren={setChildren}
          provider={provider}
          setProvider={setProvider}
          setOptionProvider={(data) => {
            setOptionProvider({
              ...data,
              use_args: true
            })
          }}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          options={optionProvider?.options}
          optionsChanged={optionProvider?.optionsChanged}
          title={title}
          clear={clear}
          type={providerType}
          compact
          requiresRequest={requiresRequest}
          style={{
            display: inline ? 'inline-block' : 'block'
          }}
          onReset={reset}
        />
        {optionProvider?.desc && (
          <ReqoreMessage intent="info" flat inverted size="small">
            <div>
              <ReactMarkdown>{optionProvider.desc}</ReactMarkdown>
            </div>
          </ReqoreMessage>
        )}
      </ReqorePanel>
      <Spacer size={15} />
      {provider === 'factory' && optionProvider ? (
        <>
          <ReqorePanel collapsible label="Factory options" padded rounded>
            <Options
              onChange={(nm, val) => {
                setOptionProvider((cur) => ({
                  ...cur,
                  options: val,
                  optionsChanged: !isEqual(optionProvider.options, val)
                }))
              }}
              name="options"
              value={optionProvider.options}
              customUrl={`${getUrlFromProvider(optionProvider, true)}`}
            />
          </ReqorePanel>
          <Spacer size={15} />
        </>
      ) : null}
      {/* This means that we are working with an API Call provider */}
      {requiresRequest && optionProvider?.supports_request ? (
        <>
          <ReqorePanel label="Allow API arguments" unMountContentOnCollapse rounded padded>
            <ApiCallArgs
              value={optionProvider?.args?.value}
              url={`${getUrlFromProvider(optionProvider)}`}
              onChange={(_nm, value, type) => {
                setOptionProvider((cur) => ({
                  ...cur,
                  args: {
                    type,
                    value
                  }
                }))
              }}
            />
          </ReqorePanel>
        </>
      ) : null}
      {/* This means that we are working with a record search */}
      {recordType && optionProvider && shouldShowSearchArguments(recordType, optionProvider) ? (
        <>
          <ReqorePanel collapsible label="Search arguments" padded rounded>
            <RecordQueryArgs
              type="search"
              url={getUrlFromProvider(optionProvider, false, true)}
              value={optionProvider?.search_args as IOptions}
              onChange={(nm, val) => {
                setOptionProvider((cur: IProviderType | null) => {
                  const result: IProviderType = {
                    ...cur,
                    search_args: val
                  } as IProviderType

                  return result
                })
              }}
            />
          </ReqorePanel>
          <Spacer size={15} />
          <ReqorePanel collapsible label="Search options" padded rounded>
            <Options
              onChange={(nm, val) => {
                setOptionProvider((cur: IProviderType | null) => {
                  const result: IProviderType = {
                    ...cur,
                    search_options: val
                  } as IProviderType

                  return result
                })
              }}
              name="search_options"
              value={optionProvider.search_options}
              customUrl={`${getUrlFromProvider(optionProvider, false, true)}/search_options`}
            />
          </ReqorePanel>
        </>
      ) : null}
      {/* This means that we are working with a record update */}
      {recordType && optionProvider && supportsArguments[recordType] ? (
        <ReqorePanel collapsible label={`${capitalize(recordType)} options`} padded rounded>
          <RecordQueryArgs
            type={recordType}
            asList={supportsList[recordType]}
            url={getUrlFromProvider(optionProvider, false, true)}
            value={optionProvider?.[`${recordType}_args`]}
            onChange={(_nm, val) => {
              setOptionProvider((cur: IProviderType | null) => {
                const result: IProviderType = {
                  ...cur,
                  [`${recordType}_args`]: val
                } as IProviderType

                return result
              })
            }}
            hasOperators={supportsOperators[recordType] || false}
          />
        </ReqorePanel>
      ) : null}
    </div>
  )
}

const PreviewProvider = (props: IConnectorFieldProps) => {
  const [value, setValue] = useState<IProviderType>({
    type: 'datasource',
    name: 'omquser',
    supports_read: true,
    supports_update: true,
    supports_create: true,
    supports_delete: true,
    path: '/bb_local',
    use_args: true,
    search_options: {
      requires_result: {
        type: 'bool',
        value: null
      }
    }
  })

  return (
    <ConnectorField
      {...props}
      value={{
        ...value,
        ...((props?.value as IProviderType) || {})
      }}
      onChange={(_name, val) => setValue(val as any)}
    />
  )
}

setupPreviews(PreviewProvider, {
  'API Call': {
    name: 'ApiCall',
    value: undefined,
    requiresRequest: true
  },
  Search: {
    name: 'Search',
    value: {
      search_args: {
        remote_id: {
          type: 'string',
          op: ['='],
          value: '123'
        }
      }
    } as any,
    recordType: 'search'
  },
  Update: {
    name: 'Update',
    value: undefined,
    recordType: 'update'
  },
  Create: {
    name: 'Create',
    value: undefined,
    recordType: 'create'
  },
  Delete: {
    name: 'Delete',
    value: undefined,
    recordType: 'delete'
  }
})

export default ConnectorField
