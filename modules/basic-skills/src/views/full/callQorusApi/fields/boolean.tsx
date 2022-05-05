import { Switch } from '@blueprintjs/core'
import React, { FormEvent } from 'react'
import useMount from 'react-use/lib/useMount'
import { isUndefined } from 'util'
import { getValueOrDefaultValue } from '../validator'

const BooleanField = ({ name, onChange, value, default_value, disabled }: any) => {
  useMount(() => {
    // Set the default value
    onChange(name, getValueOrDefaultValue(value, default_value || false, false))
  })

  const handleEnabledChange: (event: FormEvent<HTMLInputElement>) => void = () => {
    // Run the onchange
    if (onChange) {
      onChange(name, !value)
    }
  }

  if (isUndefined(value)) {
    return null
  }

  return (
    <Switch
      disabled={disabled}
      checked={value || false}
      large
      onChange={handleEnabledChange}
      name={`field-${name}`}
      className={`field-switch-${name}`}
    />
  )
}

export default BooleanField
