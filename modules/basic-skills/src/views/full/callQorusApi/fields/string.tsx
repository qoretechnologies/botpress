import { Button, ButtonGroup, Classes, InputGroup } from '@blueprintjs/core'
import React, { ChangeEvent } from 'react'
import useMount from 'react-use/lib/useMount'
import { isNull } from 'util'
import { getValueOrDefaultValue } from '../validator'

export interface IStringField {
  fill?: boolean
  read_only?: boolean
  placeholder?: string
  canBeNull?: boolean
  sensitive?: boolean
  autoFocus?: boolean
  onChange?: Function
}

const StringField = ({
  name,
  onChange,
  value,
  default_value,
  fill,
  read_only,
  disabled,
  placeholder,
  canBeNull,
  sensitive,
  autoFocus
}: IStringField & any) => {
  // Fetch data on mount
  useMount(() => {
    // Populate default value
    onChange && onChange(name, getValueOrDefaultValue(value, default_value, canBeNull))
  })

  // When input value changes
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(name, event.target.value)
  }

  // Clear the input on reset click
  const handleResetClick = (): void => {
    onChange(name, '')
  }

  return (
    <InputGroup
      name={`field-${name}`}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={read_only}
      className={fill && Classes.FILL}
      value={canBeNull && isNull(value) ? 'Value set to [null]' : !value ? default_value || '' : value}
      onFocus={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onChange={handleInputChange}
      type={sensitive ? 'password' : 'text'}
      autoFocus={autoFocus}
      rightElement={
        value &&
        value !== '' &&
        !read_only &&
        !disabled && (
          <ButtonGroup minimal>
            <Button name={`reset-field-${name}`} onClick={handleResetClick} icon={'cross'} />
          </ButtonGroup>
        )
      }
    />
  )
}

export default StringField
