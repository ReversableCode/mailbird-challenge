import type { PropsWithChildren } from 'react'
import { IoCloseOutline, IoMenuOutline } from 'react-icons/io5'

import { useUI } from '../contexts/ui.context'

import Sidebar from '../components/layout/Sidebar'
import MobileSidebar from '../components/layout/MobileSidebar'
import AuthenticationModal from '../components/AuthenticationModal'

export default function InboxLayout({ children }: PropsWithChildren<unknown>) {
  const {
    toggleSidebar,
    inbox: { selectedFolder, selectedEmail },
    setSelectedEmail,
  } = useUI()

  return (
    <>
      <Sidebar />
      <MobileSidebar />

      <div className="flex flex-col flex-1 xl:pl-72">
        {/* The start of tablet header */}
        <div className="sticky top-0 z-10 h-16 bg-white border-b xl:hidden">
          <div className="flex flex-row items-center justify-start w-full h-full px-4">
            <button
              type="button"
              className="inline-flex items-center justify-center w-10 h-10 mr-2 text-gray-500 rounded-md hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => toggleSidebar(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <IoMenuOutline className="w-6 h-6" aria-hidden="true" />
            </button>
            <h1 className="text-xl font-bold tracking-wide">{selectedFolder === 'INBOX' ? 'Inbox' : selectedFolder}</h1>
            {!!selectedEmail && (
              <button
                type="button"
                className="inline-flex items-center justify-center w-10 h-10 ml-auto text-gray-500 rounded-md hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                onClick={() => setSelectedEmail(null)}
              >
                <span className="sr-only">Close email</span>
                <IoCloseOutline className="w-6 h-6" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        {/* The end of tablet header */}

        <main className="flex-1 border-l">{children}</main>
      </div>

      <AuthenticationModal />
    </>
  )
}
