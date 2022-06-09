import { Callout } from '@blueprintjs/core'
import React, { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import styled from 'styled-components'
import { fetchData } from '../utils'
import Auto from './auto'
import { t } from './dataProvider'
import Options from './systemOptions'

type IApiCallArgsField = {
  value: string | number | { [key: string]: any }
  onChange: (name: string, value: string | number | { [key: string]: any }, type: string) => void
  url: string
}

export const StyledPairField: any = styled.div`
  margin-bottom: 10px;
`

export const ApiCallArgs = ({ url, onChange, value }: IApiCallArgsField) => {
  const {
    value: schema,
    loading,
    error
  } = useAsyncRetry(async () => {
    const data = await fetchData(`${url}/request?context=ui`)

    if (data.error) {
      throw new Error(data.error)
    }

    return data.data
  }, [url])

  useEffect(() => {
    if (schema?.type === 'nothing') {
      onChange('apicallargs', undefined, 'nothing')
    }
  }, [schema])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (schema?.type === 'nothing') {
    return <Callout intent="warning">{t('APICallTakesNoArgs')}</Callout>
  }

  if (schema.type === 'hash') {
    return (
      <Options
        name="field"
        onChange={(n, v) => onChange(n, v, schema.type)}
        value={value as any}
        options={schema.arg_schema}
        placeholder="AddArgument"
      />
    )
  }

  return (
    <Auto
      name="field"
      onChange={(n, v) => onChange(n, v, schema.type)}
      value={value}
      defaultType={schema.type.replace('*', '')}
      requestFieldData={(key) => {
        if (key === 'can_be_undefined') {
          return schema.type.startsWith('*')
        }
      }}
    />
  )
}
