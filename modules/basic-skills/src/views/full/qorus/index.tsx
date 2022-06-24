import { setupPreviews } from '@previewjs/plugin-react/setup'
import { ReqorePanel, ReqoreUIProvider } from '@qoretechnologies/reqore'
import { map } from 'lodash'
import React, { useEffect, useState } from 'react'
import style from '../style.scss'
import Spacer from './components/Spacer'
import DataProvider, { IProviderType } from './fields/dataProvider'
import SelectField from './fields/select'
import { validateField } from './validator'

export type TSkillType = 'api-call' | 'search' | 'create' | 'update' | 'delete'

const Skills = {
  'api-call': {
    name: 'API Call',
    value: 'api-call',
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

  useEffect(() => {
    // Check if the provider is valid
    const isValid = validateField(skillType, provider)
    console.log(isValid)
    // This call enabled / disables the submit button
    onValidChanged?.(isValid)
    // Save the data if they are valid
    if (isValid) {
      onDataChanged?.({ randomId: Date.now(), provider, skillType })
    }
  }, [provider, skillType])

  return (
    <div className={style.modalContent} style={{ backgroundColor: '#ffffff', minHeight: '60vh' }}>
      <ReqoreUIProvider theme={{ main: '#ffffff' }}>
        <ReqorePanel padded rounded label="Select Qorus skill">
          <SelectField
            defaultItems={map(Skills, (skill, key) => skill)}
            value={Skills[skillType]?.name}
            onChange={(n, v) => {
              setProvider(null)
              onValidChanged?.(false)
              setSkillType(v)
            }}
          />
        </ReqorePanel>
        <Spacer size={10} />
        {skillType && (
          <DataProvider
            key={skillType}
            name="test"
            value={provider}
            onChange={(n, v) => setProvider(v)}
            requiresRequest={skillType === 'api-call'}
            recordType={skillType === 'api-call' ? undefined : skillType}
          />
        )}
      </ReqoreUIProvider>
    </div>
  )
}

setupPreviews(Qorus, {
  Default: {}
})
