import { ReqoreUIProvider } from '@qoretechnologies/reqore'
import React, { useEffect, useState } from 'react'
import style from '../style.scss'
import DataProvider, { IProviderType } from './fields/dataProvider'
import { validateField } from './validator'

export const SearchSingle = ({ onValidChanged, onDataChanged, initialData }) => {
  const [provider, setProvider] = useState<IProviderType | string>(initialData?.provider)

  console.log(provider)

  useEffect(() => {
    // Check if the provider is valid
    const isValid = validateField('search-single', provider)
    // This call enabled / disables the submit button
    onValidChanged(isValid)
    // Save the data if they are valid
    if (isValid) {
      onDataChanged({ randomId: '456', provider })
    }
  }, [provider])

  return (
    <div className={style.modalContent} style={{ backgroundColor: '#ffffff', minHeight: '60vh' }}>
      <ReqoreUIProvider theme={{ main: '#ffffff' }}>
        <DataProvider name="test2" value={provider} onChange={(n, v) => setProvider(v)} isRecordSearch />
      </ReqoreUIProvider>
    </div>
  )
}
