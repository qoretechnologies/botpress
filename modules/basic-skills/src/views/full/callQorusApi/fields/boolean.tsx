import { ReqoreCheckbox } from '@qoretechnologies/reqore'
import React from 'react'
import useMount from 'react-use/lib/useMount'
import { isUndefined } from 'util'
import { getValueOrDefaultValue } from '../validator'

const BooleanField = ({ name, onChange, value, default_value, disabled }: any) => {
  useMount(() => {
    // Set the default value
    onChange(name, getValueOrDefaultValue(value, default_value || false, false))
  })

  const handleEnabledChange = () => {
    // Run the onchange
    if (onChange) {
      onChange(name, !value)
    }
  }

  if (isUndefined(value)) {
    return null
  }

  return (
    <ReqoreCheckbox
      disabled={disabled}
      checked={value || false}
      asSwitch
      onClick={handleEnabledChange}
      className={`field-switch-${name}`}
    />
  )
}

export default BooleanField
