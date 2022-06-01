import { Icon, Intent } from '@blueprintjs/core'
import React, { FunctionComponent } from 'react'
import useMount from 'react-use/lib/useMount'
import styled from 'styled-components'
import HorizontalSpacer from '../components/HorizontalSpacer'
import { t } from './dataProvider'

export interface IRadioField {
  disabled?: boolean
}

const StyledRadio = styled.div`
  line-height: 30px;
  height: 30px;
  cursor: pointer;

  p {
    display: inline-block;
    margin: 0;
    margin-left: 10px;
  }
`

const LangIcon = styled.img`
  display: inline-block;
  height: 15px;
  width: 15px;
  margin-left: 10px;
  vertical-align: sub;
`

const icons = {
  qore: 'qore-106x128.png',
  python: 'python-129x128.png'
}

const RadioField: FunctionComponent<IRadioField & any> = ({
  items,
  default_value,
  onChange,
  name,
  value,
  disabled
}) => {
  useMount(() => {
    // Set the default value
    if (!value && default_value) {
      onChange(name, default_value)
    }
  })

  const handleValueChange: (value: string) => void = (value) => {
    // Send the change
    onChange(name, value)
  }

  return (
    <div>
      {items.map((v: { value: string; icon_filename: string; icon?: string; isDivider?: boolean; title?: string }) =>
        v.isDivider ? (
          <div key={v.value} style={{ marginTop: '10px', marginBottom: '10px' }}>
            <Icon icon="dot" iconSize={15} />
            <HorizontalSpacer size={10} />
            <strong>{v.title}</strong>
          </div>
        ) : (
          <StyledRadio onClick={() => !disabled && handleValueChange(v.value)}>
            <Icon
              icon={value === v.value ? 'selection' : 'circle'}
              intent={value === v.value ? Intent.PRIMARY : Intent.NONE}
              color={disabled ? '#d7d7d7' : '#333'}
            />
            <p>{t(`field-label-${v.value}`)}</p>
          </StyledRadio>
        )
      )}
    </div>
  )
}

export default RadioField
