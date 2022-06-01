import { ReqoreButton, ReqoreControlGroup } from '@qoretechnologies/reqore'
import { reduce, size } from 'lodash'
import React, { useEffect } from 'react'
import Spacer from '../components/Spacer'
import SubField from '../components/SubField'
import { fetchData } from '../utils'
import { t, TRecordType } from './dataProvider'
import Options, { IOptions, IOptionsSchema } from './systemOptions'

export interface ISearchArgsProps {
  value?: IOptions | IOptions[]
  asList?: boolean
  type: TRecordType
  url: string
  onChange: (name: string, value?: IOptions | IOptions[]) => void
  hasOperators?: boolean
}

export const RecordQueryArgs = ({ value, url, onChange, type, hasOperators, asList }: ISearchArgsProps) => {
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
    return <p>{t('Loading arguments...')}</p>
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

  if (asList) {
    return (
      <>
        {value &&
          (value as IOptions[]).map((options: IOptions, index: number) => (
            <SubField
              title={`${t('Record')} ${index + 1}`}
              key={index}
              subtle
              onRemove={() => {
                // Filter out the items from value with this index
                onChange(
                  `${type}_args`,
                  ((value || []) as IOptions[]).filter((_options: IOptions, idx: number) => idx !== index)
                )
              }}
            >
              <Options
                onChange={(name, newOptions?: IOptions) => {
                  const newValue = [...(value as IOptions[])]
                  // Update the field
                  newValue[index] = newOptions
                  // Update the pairs
                  onChange(name, newValue)
                }}
                name={`${type}_args`}
                value={options}
                operatorsUrl={hasOperators ? `${url}/search_operators?context=ui` : undefined}
                options={transformedOptions}
                placeholder={t('Add argument')}
                noValueString={t('No argument')}
              />
            </SubField>
          ))}
        <Spacer size={15} />
        <ReqoreControlGroup fluid style={{ marginBottom: '10px' }}>
          <ReqoreButton
            icon="AddBoxLine"
            onClick={() => onChange(`${type}_args`, [...((value || []) as IOptions[]), {}])}
          >
            Add another record
          </ReqoreButton>
        </ReqoreControlGroup>
      </>
    )
  }

  return (
    <Options
      onChange={onChange}
      name="search_args"
      value={value as IOptions}
      operatorsUrl={`${url}/search_operators?context=ui`}
      options={transformedOptions}
      placeholder={t('Add search argument')}
      noValueString={t('No search arguments added yet. At least 1 search arg is required.')}
    />
  )
}
