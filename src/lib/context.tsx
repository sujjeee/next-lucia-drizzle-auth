import React, { createContext, useContext, useState } from "react"

interface IPContextType {
  ip: string | null
  setIP: (ip: string) => void
}

const IPContext = createContext<IPContextType | undefined>(undefined)

export const IPProvider = ({
  realIP,
  children,
}: {
  realIP: string | null
  children: React.ReactNode
}) => {
  const [ip, setIP] = useState<string | null>(realIP)

  return (
    <IPContext.Provider value={{ ip, setIP }}>{children}</IPContext.Provider>
  )
}

export const useIP = () => {
  const context = useContext(IPContext)

  if (!context) {
    throw new Error("useIP must be used within an IPProvider")
  }

  return context
}
