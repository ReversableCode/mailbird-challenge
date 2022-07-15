/* eslint-disable @next/next/no-img-element */
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { IoFolderOutline, IoFileTrayFull, IoCloseOutline } from 'react-icons/io5'

import classNames from 'classnames'

import { useUI } from '../../contexts/ui.context'
import ConnectionStatus from '../common/ConnectionStatus'

export default function MobileSidebar() {
  const {
    displaySidebar,
    toggleSidebar,
    inbox: { folders, selectedFolder },
    setEmails,
    setSelectedEmail,
    setSelectedFolder,
    fetchEmailHeaders,
  } = useUI()

  const handleFolderClick = (folder: string) => {
    if (selectedFolder !== folder) {
      setEmails([])
      setSelectedEmail(null)
      setSelectedFolder(folder)
      fetchEmailHeaders(folder, true)
    }
  }

  return (
    <Transition.Root show={displaySidebar} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-40 flex xl:hidden" onClose={() => toggleSidebar(false)}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-opacity-75 bg-slate-600" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="transition ease-in-out duration-300 transform"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <div className="relative flex flex-col flex-1 w-full max-w-xs bg-white">
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute top-0 right-0 pt-2 -mr-12">
                <button
                  type="button"
                  className="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => toggleSidebar(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <IoCloseOutline className="w-6 h-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </Transition.Child>
            <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center justify-center flex-shrink-0 h-8 px-4">
                <h1 className="text-3xl font-bold text-slate-900">Webmail</h1>
              </div>
              <ConnectionStatus />
              <span className="px-4 mt-16 text-xs font-semibold text-left text-slate-500">MAILBOX</span>
              <nav className="flex px-4 mt-2 space-y-1">
                <button
                  className={classNames(
                    selectedFolder === 'INBOX' ? 'bg-blue-200 text-slate-900' : 'text-slate-600 hover:text-slate-900',
                    'group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300',
                  )}
                  onClick={() => handleFolderClick('INBOX')}
                >
                  <IoFileTrayFull
                    className={classNames(
                      selectedFolder === 'INBOX' ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-500',
                      'mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-300',
                    )}
                    aria-hidden="true"
                  />
                  Inbox
                </button>
              </nav>
              <span className="px-4 mt-12 text-xs font-semibold text-left text-slate-500">FOLDERS</span>
              <nav className="flex-1 px-4 mt-2 space-y-1">
                {folders.map(
                  (folder) =>
                    folder !== 'INBOX' && (
                      <button
                        key={folder}
                        className={classNames(
                          selectedFolder === folder
                            ? 'bg-blue-200 text-slate-900'
                            : 'text-slate-600 hover:text-slate-900',
                          'group flex w-full items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300',
                        )}
                        onClick={() => handleFolderClick(folder)}
                      >
                        <IoFolderOutline
                          className={classNames(
                            selectedFolder === folder ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-500',
                            'mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-300',
                          )}
                          aria-hidden="true"
                        />
                        {folder}
                      </button>
                    ),
                )}
              </nav>
            </div>
          </div>
        </Transition.Child>
        <div className="flex-shrink-0 w-14" />
      </Dialog>
    </Transition.Root>
  )
}
