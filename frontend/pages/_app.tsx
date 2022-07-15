import '../styles/globals.css'
import '../styles/unreset.scss'

import type { AppProps } from 'next/app'

import { ManagedUIContext } from '../contexts/ui.context'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ManagedUIContext>
      <Component {...pageProps} />
    </ManagedUIContext>
  )
}

export default MyApp
