import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '@qoretechnologies/reqore'
import React from 'react'
import './custom.css'

export const Wrapper = ({ children }) => {
  return (
    <ReqoreUIProvider theme={{ main: '#ffffff' }}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: '10px', height: '100%' }}>{children}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  )
}
