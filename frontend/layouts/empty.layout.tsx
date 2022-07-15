import type { PropsWithChildren } from 'react'

export default function EmptyLayout({ children }: PropsWithChildren<unknown>) {
  return <>{children}</>
}
