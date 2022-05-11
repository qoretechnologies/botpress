import React, { useEffect, useState } from 'react'
import style from '../style.scss'
import DataProvider, { IProviderType } from './fields/dataProvider'

export const CallQorusAPI = ({ onValidChanged, onDataChanged }) => {
  const [provider, setProvider] = useState<IProviderType | string>(undefined)

  useEffect(() => {
    onValidChanged(provider !== undefined)
  })

  const updateData = (data: IProviderType | string) => {
    console.log('CallQorusAPI set', data)
    setProvider(data)
    onDataChanged(data)
  }

  return (
    <div className={style.modalContent}>
      <DataProvider name="test" value={provider} onChange={(n, v) => updateData(v)} requiresRequest />
    </div>
  )
}
