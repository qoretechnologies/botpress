import React, { useEffect } from 'react'
import style from '../style.scss'

export const CallQorusAPI = ({ onValidChanged }) => {
  useEffect(() => {
    onValidChanged(true)
  })

  return (
    <div className={style.modalContent}>
      <p>Yo</p>
    </div>
  )
}
