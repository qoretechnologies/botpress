import { Button, ButtonGroup, Classes } from '@blueprintjs/core'
import { DateInput } from '@blueprintjs/datetime'
import React, { FunctionComponent } from 'react'
import useMount from 'react-use/lib/useMount'
import { getValueOrDefaultValue } from '../validator'
import { t } from './dataProvider'

export interface IDateField {
  fill?: boolean
}

const DateField: FunctionComponent<IDateField & any> = ({ name, onChange, value, default_value, disabled }) => {
  // Fetch data on mount
  useMount(() => {
    // Populate default value
    if (default_value) {
      onChange(name, getValueOrDefaultValue(value, default_value || new Date(), false))
    }
  })

  // When input value changes
  const handleInputChange = (selectedDate: Date): void => {
    onChange(name, selectedDate)
  }

  // Clear the input on reset click
  const handleResetClick = (): void => {
    onChange(name, null)
  }

  return (
    <DateInput
      timePickerProps={{}}
      closeOnSelection={false}
      disabled={disabled}
      formatDate={(date) => date.toLocaleString()}
      parseDate={(str) => new Date(str)}
      placeholder={'YYYY-MM-DDT00:00:00Z'}
      invalidDateMessage={t('InvalidDate')}
      inputProps={{ className: Classes.FILL }}
      defaultValue={new Date()}
      popoverProps={{
        targetTagName: 'div',
        wrapperTagName: 'div'
      }}
      value={!value ? new Date(default_value) : new Date(value)}
      onChange={handleInputChange}
      rightElement={
        value &&
        value !== '' && (
          <ButtonGroup minimal>
            <Button onClick={handleResetClick} icon={'cross'} />
          </ButtonGroup>
        )
      }
    />
  )
}

export default DateField
