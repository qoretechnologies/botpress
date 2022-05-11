import React, { useEffect, useState } from 'react'
import style from '../style.scss'
import DataProvider, { IProviderType } from './fields/dataProvider'
import { validateField } from './validator'

export const CallQorusAPI = ({ onValidChanged, onDataChanged, initialData }) => {
  const [provider, setProvider] = useState<IProviderType | string>(initialData?.provider)

  console.log(provider)

  useEffect(() => {
    // Check if the provider is valid
    const isValid = validateField('type-selector', provider)
    // This call enabled / disables the submit button
    onValidChanged(isValid)
    // Save the data if they are valid
    if (isValid) {
      onDataChanged({ randomId: '123', provider })
    }
  }, [provider])

  return (
    <div className={style.modalContent}>
      <DataProvider name="test" value={provider} onChange={(n, v) => setProvider(v)} requiresRequest />
    </div>
  )
}
