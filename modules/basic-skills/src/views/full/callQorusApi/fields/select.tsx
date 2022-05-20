// @ts-nocheck
import { Button, Classes, Icon } from '@blueprintjs/core'
import { ReqoreButton, ReqoreDropdown, ReqorePopover } from '@qoretechnologies/reqore'
import { IReqoreButtonProps } from '@qoretechnologies/reqore/dist/components/Button'
import { IReqoreIntent } from '@qoretechnologies/reqore/dist/constants/theme'
import { includes } from 'lodash'
import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'
import CustomDialog from '../components/CustomDialog'
import Spacer from '../components/Spacer'
import { t } from './dataProvider'
import StringField from './string'

export interface ISelectField {
  defaultItems?: any[]
  predicate: (name: string) => boolean
  placeholder: string
  fill?: boolean
  disabled?: boolean
  position?: any
  requestFieldData: (name: string, key?: string) => any
  messageData: any
  warningMessageOnEmpty?: string
  autoSelect?: boolean
  intent?: IReqoreIntent
}

export const StyledDialogSelectItem = styled.div`
  margin-bottom: 10px;
  max-height: 150px;
  overflow: hidden;
  position: relative;

  &:before {
    content: '';
    display: block;
    height: 100%;
    width: 100%;
    position: absolute;
    // Linear gradient from top transparent to bottom white
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 1) 100%
    );
    z-index: 10;
  }

  background-color: #fff;

  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  transition: all 0.2s;

  &:hover,
  &.selected {
    cursor: pointer;
    transform: scale(0.98);
    box-shadow: 0 0 10px -6px #555;
  }

  &.selected {
    border: 2px solid #7fba27;
  }

  h5 {
    margin: 0;
    padding: 0;
    font-size: 14px;
  }

  p {
    margin: 0;
    padding: 0;
    font-size: 12px;
  }
`

const SelectField = ({
  name,
  onChange,
  value,
  defaultItems,
  predicate,
  placeholder,
  fill,
  disabled,
  requestFieldData,
  autoSelect,
  iface_kind,
  context,
  editOnly,
  target_dir,
  forceDropdown,
  intent
}: ISelectField & any) => {
  const [items, setItems] = useState<any[]>(defaultItems || [])
  const [query, setQuery] = useState<string>('')
  const [isSelectDialogOpen, setSelectDialogOpen] = useState<boolean>(false)

  useEffect(() => {
    console.log(defaultItems)
    if (defaultItems) {
      setItems(defaultItems)
    }
  }, [JSON.stringify(defaultItems)])

  const handleEditSubmit: (_defaultName: string, val: string) => void = (_defaultName, val) => {
    handleSelectClick({ name: val })
  }

  const handleSelectClick: (item: any) => void = (item) => {
    if (item === value) {
      return
    }
    // Set the selected item
    onChange(name, item.name)
  }

  let filteredItems: any[] = items

  // If we should run the items thru predicate
  if (predicate) {
    filteredItems = filteredItems.filter((item) => predicate(item.name))
  }

  if (autoSelect && filteredItems.length === 1) {
    // Automaticaly select the first item
    if (filteredItems[0].name !== value) {
      handleSelectClick(filteredItems[0])
    }
    // Show readonly string
    return <StringField value={value || filteredItems[0].name} read_only name={name} onChange={() => {}} />
  }

  const hasItemsWithDesc = (data) => {
    return data.some((item) => item.desc)
  }

  if (!filteredItems || filteredItems.length === 0) {
    return <Button fill={fill} text={t('NoDataAvailable')} rightIcon={'caret-down'} icon="disable" disabled />
  }

  const filterItems = (items) => {
    return items.filter((item: any) => includes(item.name.toLowerCase(), query.toLowerCase()))
  }

  const getItemDescription = (itemName) => {
    return items.find((item) => item.name === itemName)?.desc
  }

  return (
    <>
      {!filteredItems || filteredItems.length === 0 ? (
        <StringField value={t('NothingToSelect')} read_only disabled name={name} onChange={() => {}} />
      ) : (
        <>
          {hasItemsWithDesc(items) && !forceDropdown ? (
            <>
              <ReqorePopover
                placement="top"
                isReqoreComponent
                component={ReqoreButton}
                content={
                  <ReactMarkdown>
                    {value ? getItemDescription(value) || t('No description') : t('Please select')}
                  </ReactMarkdown>
                }
                componentProps={
                  {
                    flat: true,
                    rightIcon: 'WindowFill',
                    onClick: () => setSelectDialogOpen(true),
                    disabled,
                    intent
                  } as IReqoreButtonProps
                }
              >
                {value ? value : placeholder || t('Please select')}
              </ReqorePopover>
              {isSelectDialogOpen && (
                <CustomDialog
                  isOpen
                  blur={5}
                  flat={false}
                  icon="ListOrdered"
                  onClose={() => {
                    setSelectDialogOpen(false)
                    setQuery('')
                  }}
                  title={t('Select item to add')}
                >
                  <div style={{ padding: '10px' }}>
                    <div>
                      <StringField
                        onChange={(_name, value) => setQuery(value)}
                        value={query}
                        name="select-filter"
                        placeholder={t('Filter')}
                        autoFocus
                      />
                      <Spacer size={10} />
                    </div>
                    <div style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                      {filterItems(filteredItems).map((item) => (
                        <ReqorePopover
                          placement="top"
                          component={StyledDialogSelectItem}
                          content={<ReactMarkdown>{item.desc}</ReactMarkdown>}
                          componentProps={{
                            style: {
                              width: '100%'
                            },
                            className: item.name === value ? 'selected' : '',
                            onClick: () => {
                              handleSelectClick(item)
                              setSelectDialogOpen(false)
                              setQuery('')
                            }
                          }}
                        >
                          <h5>
                            {item.name === value && <Icon icon="small-tick" style={{ color: '#7fba27' }} />} {item.name}
                          </h5>

                          <p className={Classes.TEXT_MUTED}>
                            <ReactMarkdown>{item.desc || t('NoDescription')}</ReactMarkdown>
                          </p>
                        </ReqorePopover>
                      ))}
                    </div>
                  </div>
                </CustomDialog>
              )}
            </>
          ) : (
            <ReqoreDropdown
              items={items.map((item) => ({
                label: item.name,
                selected: item.name === value,
                intent: item.name === value ? 'info' : undefined,
                onClick: () => handleSelectClick(item)
              }))}
              label={value ? value : placeholder || t('Please select')}
              closeOnOutsideClick
              filterable
              componentProps={
                {
                  disabled,
                  flat: true,
                  intent
                } as IReqoreButtonProps
              }
            />
          )}
        </>
      )}
    </>
  )
}

export default SelectField
