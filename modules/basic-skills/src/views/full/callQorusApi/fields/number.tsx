import { Classes } from '@blueprintjs/core'
import { ReqoreInput } from '@qoretechnologies/reqore'
import React, { ChangeEvent, FunctionComponent } from 'react'

export interface INumberField {
  fill?: boolean
}

const NumberField: FunctionComponent<INumberField & any> = ({ name, onChange, value, default_value, type, fill }) => {
  // When input value changes
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(
      name,
      type === 'int' || type === 'number' ? parseInt(event.target.value, 10) : parseFloat(event.target.value)
    )
  }

  // Clear the input on reset click
  const handleResetClick = (): void => {
    onChange(name, null)
  }

  return (
    <ReqoreInput
      className={fill && Classes.FILL}
      value={value ?? default_value ?? ''}
      onChange={handleInputChange}
      onClearClick={handleResetClick}
      // @ts-expect-error
      type="number"
    />
  )
}

export default NumberField
