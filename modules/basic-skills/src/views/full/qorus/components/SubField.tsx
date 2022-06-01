import { ReqoreMessage, ReqorePanel } from '@qoretechnologies/reqore'
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

const SubField: React.FC<ISubFieldProps> = ({ title, desc, children, subtle, onRemove, detail, isValid }) => (
  <>
    {title && (
      <ReqorePanel
        flat
        padded
        rounded
        label={title}
        actions={[{ label: `<${detail} />` }, { onClick: onRemove, icon: 'DeleteBin6Line', intent: 'danger' }]}
      >
        {desc && (
          <ReqoreMessage intent="info" inverted size="small" flat>
            <StyledSubFieldMarkdown>
              <ReactMarkdown>{desc}</ReactMarkdown>
            </StyledSubFieldMarkdown>
          </ReqoreMessage>
        )}
        {desc && <Spacer size={10} />}
        {children}
      </ReqorePanel>
    )}
  </>
)

export default SubField
