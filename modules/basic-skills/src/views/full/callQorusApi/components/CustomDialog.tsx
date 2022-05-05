import { Dialog, IDialogProps } from '@blueprintjs/core'
import React from 'react'

export interface ICustomDialogProps extends IDialogProps {
  children: any
  noBottomPad?: boolean
}

const CustomDialog: React.FC<ICustomDialogProps> = ({ children, noBottomPad, ...rest }) => {
  return (
    <Dialog {...rest} canEscapeKeyClose={false}>
      {children}
    </Dialog>
  )
}

export default CustomDialog
