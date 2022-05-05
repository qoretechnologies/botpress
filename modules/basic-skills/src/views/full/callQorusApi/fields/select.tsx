import { Button, Classes, ControlGroup, Icon, MenuItem, Tooltip } from '@blueprintjs/core'
import { Select } from '@blueprintjs/select'
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
}

export const StyledDialogSelectItem = styled.div`
  &:not(:last-child) {
    margin-bottom: 10px;
  }

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

const SelectField: React.FC<ISelectField & any> = ({
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
  forceDropdown
}) => {
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
    <ControlGroup fill={fill}>
      {!filteredItems || filteredItems.length === 0 ? (
        <StringField value={t('NothingToSelect')} read_only disabled name={name} onChange={() => {}} />
      ) : (
        <>
          {hasItemsWithDesc(items) && !forceDropdown ? (
            <>
              <Tooltip
                position="top"
                boundary="viewport"
                targetProps={{
                  style: {
                    width: '100%'
                  }
                }}
                content={
                  <ReactMarkdown>
                    {value ? getItemDescription(value) || t('NoDescription') : t('PleaseSelect')}
                  </ReactMarkdown>
                }
              >
                <Button
                  name={`field-${name}`}
                  fill={fill}
                  text={value ? value : placeholder || t('PleaseSelect')}
                  rightIcon="widget-header"
                  onClick={() => setSelectDialogOpen(true)}
                  disabled={disabled}
                />
              </Tooltip>
              {isSelectDialogOpen && (
                <CustomDialog
                  isOpen
                  icon="list"
                  onClose={() => {
                    setSelectDialogOpen(false)
                    setQuery('')
                  }}
                  title={t('SelectItem')}
                  style={{
                    maxHeight: '80vh',
                    width: '50vw',
                    minWidth: '500px',
                    overflow: 'auto',
                    padding: 0
                  }}
                >
                  <div
                    className={Classes.DIALOG_BODY}
                    style={{ display: 'flex', flexFlow: 'column', overflow: 'hidden' }}
                  >
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
                        <Tooltip
                          position="top"
                          boundary="viewport"
                          targetProps={{
                            style: {
                              width: '100%'
                            }
                          }}
                          hoverOpenDelay={500}
                          interactionKind="hover"
                          content={<ReactMarkdown>{item.desc}</ReactMarkdown>}
                        >
                          <StyledDialogSelectItem
                            className={item.name === value ? 'selected' : ''}
                            onClick={() => {
                              handleSelectClick(item)
                              setSelectDialogOpen(false)
                              setQuery('')
                            }}
                          >
                            <h5>
                              {item.name === value && <Icon icon="small-tick" style={{ color: '#7fba27' }} />}{' '}
                              {item.name}
                            </h5>

                            <p className={Classes.TEXT_MUTED}>
                              <ReactMarkdown>{item.desc || t('NoDescription')}</ReactMarkdown>
                            </p>
                          </StyledDialogSelectItem>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </CustomDialog>
              )}
            </>
          ) : (
            <Select
              items={query === '' ? filteredItems : filterItems(filteredItems)}
              itemRenderer={(item, data) => (
                <MenuItem
                  title={item.desc}
                  icon={value && item.name === value ? 'tick' : 'blank'}
                  text={item.name}
                  onClick={data.handleClick}
                />
              )}
              inputProps={{
                placeholder: t('Filter'),
                name: 'field-select-filter',
                autoFocus: true
              }}
              popoverProps={{
                popoverClassName: 'custom-popover',
                targetClassName: fill ? 'select-popover' : '',
                position: 'left'
              }}
              className={fill ? Classes.FILL : ''}
              onItemSelect={(item: any) => handleSelectClick(item)}
              query={query}
              onQueryChange={(newQuery: string) => setQuery(newQuery)}
              disabled={disabled}
            >
              <Button
                name={`field-${name}`}
                fill={fill}
                text={value ? value : placeholder || t('PleaseSelect')}
                rightIcon={'caret-down'}
              />
            </Select>
          )}
        </>
      )}
    </ControlGroup>
  )
}

export default SelectField
