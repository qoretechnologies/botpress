import { reduce, size } from 'lodash'
import React, { useEffect } from 'react'
import { fetchData } from '../utils'
import { t } from './dataProvider'
import Options, { IOptions, IOptionsSchema } from './systemOptions'

export interface ISearchArgsProps {
  value?: IOptions
  url: string
  onChange: (name: string, value?: IOptions) => void
}

export const SearchArgs = ({ value, url, onChange }: ISearchArgsProps) => {
  const [options, setOptions] = React.useState<any>(undefined)

  useEffect(() => {
    ;(async () => {
      // Set fields and operators to undefined
      setOptions(undefined)
      // Fetch the fields and operators
      const fieldsData = await fetchData(`/${url}/record`)
      // Set the data
      setOptions(fieldsData.data)
    })()
  }, [url])

  if (!size(options)) {
    return <p>{t('LoadingSearchArgs')}</p>
  }

  const transformedOptions: IOptionsSchema =
    options &&
    reduce(
      options,
      (newOptions: IOptionsSchema, optionData, optionName): IOptionsSchema => ({
        ...newOptions,
        [optionName]: {
          type: optionData.type.base_type,
          desc: optionData.desc
        }
      }),
      {}
    )

  return (
    <Options
      onChange={onChange}
      name="search_args"
      value={value}
      operatorsUrl={`${url}/search_operators`}
      options={transformedOptions}
      placeholder={t('Add search argument')}
      noValueString={t('No search arguments added yet. At least 1 search arg is required.')}
    />
  )
}
