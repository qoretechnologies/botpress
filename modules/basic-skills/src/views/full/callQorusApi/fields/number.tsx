import { Button, ButtonGroup, Classes, InputGroup } from '@blueprintjs/core'
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
    <InputGroup
      name={`field-${name}`}
      className={fill && Classes.FILL}
      value={value ?? default_value ?? ''}
      onChange={handleInputChange}
      type="number"
      step={type === 'int' || type === 'number' ? 1 : 0.1}
      rightElement={
        (value && value !== '') || value === 0 ? (
          <ButtonGroup minimal>
            <Button onClick={handleResetClick} icon={'cross'} />
          </ButtonGroup>
        ) : null
      }
    />
  )
}

export default NumberField
