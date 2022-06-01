import { setupPreviews } from '@previewjs/plugin-react/setup'
import { ReqoreMessage, ReqorePanel, ReqoreUIProvider } from '@qoretechnologies/reqore'
import { map } from 'lodash'
import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import style from '../style.scss'
import Spacer from './components/Spacer'
import { StyledSubFieldMarkdown } from './components/SubField'
import DataProvider, { IProviderType } from './fields/dataProvider'
import SelectField from './fields/select'
import { validateField } from './validator'

export type TSkillType = 'apicall' | 'search' | 'create' | 'update' | 'delete'

const Skills = {
  apicall: {
    name: 'API Call',
    value: 'apicall',
    desc: 'Make an API call to a third party service'
  },
  search: {
    name: 'Search',
    value: 'search',
    desc: 'Search for data in a third party service'
  },
  create: {
    name: 'Create',
    value: 'create',
    desc: 'Create data in a third party service'
  },
  update: {
    name: 'Update',
    value: 'update',
    desc: 'Update data in a third party service'
  },
  delete: {
    name: 'Delete',
    value: 'delete',
    desc: 'Delete data in a third party service'
  }
}

export const Qorus = ({ onValidChanged, onDataChanged, initialData }) => {
  const [provider, setProvider] = useState<IProviderType | string>(initialData?.provider)
  const [skillType, setSkillType] = useState<TSkillType>(initialData?.skillType)

  console.log(provider)

  useEffect(() => {
    // Check if the provider is valid
    const isValid = validateField('type-selector', provider)
    // This call enabled / disables the submit button
    onValidChanged?.(isValid)
    // Save the data if they are valid
    if (isValid) {
      onDataChanged?.({ randomId: Date.now(), provider, skillType })
    }
  }, [provider])

  useEffect(() => {
    setProvider(null)
    onValidChanged?.(false)
  }, [skillType])

  return (
    <div className={style.modalContent} style={{ backgroundColor: '#ffffff', minHeight: '60vh' }}>
      <ReqoreUIProvider theme={{ main: '#ffffff' }}>
        <ReqorePanel padded rounded label="Select Qorus skill">
          <SelectField
            defaultItems={map(Skills, (skill, key) => skill)}
            value={Skills[skillType]?.name}
            onChange={(n, v) => setSkillType(v)}
          />
          {skillType && (
            <ReqoreMessage intent="info" inverted size="small" flat>
              <StyledSubFieldMarkdown>
                <ReactMarkdown>{Skills[skillType]?.desc}</ReactMarkdown>
              </StyledSubFieldMarkdown>
            </ReqoreMessage>
          )}
        </ReqorePanel>
        <Spacer size={10} />
        {skillType && (
          <DataProvider
            name="test"
            value={provider}
            onChange={(n, v) => setProvider(v)}
            requiresRequest={skillType === 'apicall'}
            recordType={skillType === 'apicall' ? undefined : skillType}
          />
        )}
      </ReqoreUIProvider>
    </div>
  )
}

setupPreviews(Qorus, {
  Default: {}
})
