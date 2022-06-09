import { ReqoreMessage, ReqorePanel } from '@qoretechnologies/reqore'
import { IReqorePanelAction } from '@qoretechnologies/reqore/dist/components/Panel'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'
import Spacer from './Spacer'

export interface ISubFieldProps {
  title?: string
  desc?: string
  children: any
  subtle?: boolean
  onRemove?: () => any
  detail?: string
  isValid?: boolean
}

export const StyledSubFieldMarkdown: any = styled.div`
  display: 'inline-block';

  p:last-child {
    margin-bottom: 0;
  }

  p:first-child {
    margin-top: 0;
  }
`

const SubField: React.FC<ISubFieldProps> = ({ title, desc, children, subtle, onRemove, detail, isValid }) => {
  let actions: IReqorePanelAction[] = [{ onClick: onRemove, icon: 'DeleteBin6Line', intent: 'danger' }]

  if (detail) {
    actions.push({ label: `<${detail} />` })
  }

  return (
    <>
      {title && (
        <ReqorePanel
          flat
          padded
          rounded
          label={title}
          actions={actions}
          intent={isValid === false ? 'danger' : undefined}
        >
          {desc && (
            <ReqorePanel flat rounded padded>
              <ReqoreMessage intent="muted" inverted size="small" flat>
                <StyledSubFieldMarkdown>
                  <ReactMarkdown>{desc}</ReactMarkdown>
                </StyledSubFieldMarkdown>
              </ReqoreMessage>
            </ReqorePanel>
          )}
          {desc && <Spacer size={10} />}
          {children}
        </ReqorePanel>
      )}
    </>
  )
}

export default SubField
