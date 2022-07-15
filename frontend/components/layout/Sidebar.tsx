/* eslint-disable @next/next/no-img-element */
import classNames from 'classnames'
import { IoFolderOutline, IoFileTrayFull } from 'react-icons/io5'

import { useUI } from '../../contexts/ui.context'
import ConnectionStatus from '../common/ConnectionStatus'

export default function Sidebar() {
  const {
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
    <div className="hidden xl:flex xl:w-72 xl:flex-col xl:fixed xl:inset-y-0">
      <div className="flex flex-col flex-1 min-h-0 bg-white">
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-center flex-shrink-0 h-8 px-4">
            <h1 className="text-3xl font-bold text-slate-900">Webmail</h1>
          </div>
          <ConnectionStatus />
          <span className="px-4 mt-8 text-xs font-semibold text-left text-slate-500">MAILBOX</span>
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
                      selectedFolder === folder ? 'bg-blue-200 text-slate-900' : 'text-slate-600 hover:text-slate-900',
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
    </div>
  )
}
