
import React, { useState } from 'react'

const AuthWidgetContext = React.createContext({
  isAuthWidgetOpen: false,
  openAuthWidget: () => { },
})

export default function useAuthWidget() {
  const { isAuthWidgetOpen, openAuthWidget } = React.useContext(AuthWidgetContext)

  return {
    isAuthWidgetOpen,
    openAuthWidget: () => openAuthWidget(),
  }
}


export function AuthWidgetProvider({ children }: { children: React.ReactNode }) {
  const [isAuthWidgetOpen, setIsAuthWidgetOpen] = useState(false)

  const openAuthWidget = () => {
    setIsAuthWidgetOpen(!isAuthWidgetOpen)
  }


  return (
    <AuthWidgetContext.Provider value={{ isAuthWidgetOpen, openAuthWidget }}>
      {children}
    </AuthWidgetContext.Provider>
  )
}
