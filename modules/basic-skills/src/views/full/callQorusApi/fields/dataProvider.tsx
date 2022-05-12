import { Tag } from '@blueprintjs/core'
import { ReqoreMessage, ReqorePanel } from '@qoretechnologies/reqore'
import { cloneDeep, isEqual, map, reduce } from 'lodash'
import size from 'lodash/size'
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useDebounce } from 'react-use'
import styled from 'styled-components'
import Spacer from '../components/Spacer'
import SubField from '../components/SubField'
import { ApiCallArgs } from './apiCallArgs'
import Provider, { providers } from './provider'
import Options, { IOptions } from './systemOptions'

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
}

export interface IProviderType {
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
}

const StyledProviderUrl = styled.div`
  min-height: 40px;
  line-height: 40px;

  span {
    font-weight: 500;
  }
`

export const getUrlFromProvider: (val: IProviderType | string, withOptions?: boolean) => string = (
  val,
  withOptions
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
  const realPath = `${suffix}${path}${endsInSubtype || is_api_call ? '' : recordSuffix || ''}${
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
  console.log(type, name, path)
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
  requiresRequest
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

  if (isEditing && value && optionProvider?.type !== 'factory') {
    return (
      <div>
        <SubField title={!minimal && t('CurrentDataProvider')}>
          <StyledProviderUrl>
            {title && <span>{title}:</span>}{' '}
            <Tag minimal large onRemove={clear}>
              {getUrlFromProvider(value)}{' '}
            </Tag>
          </StyledProviderUrl>
        </SubField>
      </div>
    )
  }

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
            setOptionProvider(data)
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
          <ReqorePanel
            label="Allow API arguments"
            actions={[
              {
                icon: 'CheckLine',
                intent: optionProvider?.use_args ? 'success' : undefined,
                onClick: () => {
                  setOptionProvider((cur) => ({
                    ...cur,
                    use_args: !optionProvider.use_args
                  }))
                }
              }
            ]}
            isCollapsed={!optionProvider.use_args}
            unMountContentOnCollapse
            rounded
            padded
          >
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
    </div>
  )
}

export default ConnectorField
