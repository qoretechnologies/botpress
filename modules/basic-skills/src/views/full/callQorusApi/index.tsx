import React, { useEffect, useState } from 'react'
import style from '../style.scss'
import DataProvider, { IProviderType } from './fields/dataProvider'

export const CallQorusAPI = ({ onValidChanged }) => {
  const [provider, setProvider] = useState<IProviderType | string>(undefined)

  useEffect(() => {
    onValidChanged(true)
  })

  console.log(provider)

  return (
    <div className={style.modalContent}>
      <DataProvider name="test" value={provider} onChange={(n, v) => setProvider(v)} requiresRequest />
    </div>
  )
}
