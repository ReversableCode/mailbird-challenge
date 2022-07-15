/* eslint-disable @next/next/no-img-element */
import classNames from 'classnames'
import TimeAgo from 'react-timeago'
import { IoFolderOutline, IoFileTrayFull } from 'react-icons/io5'

import { useUI } from '../contexts/ui.context'

import EmptyState from './common/EmptyState'
import LoadingState from './common/LoadingState'

export default function EmailList() {
  const {
    inbox: { selectedFolder, emails, selectedEmail },
    emailHeadersLoaded,
    emailBodyLoaded,
    fetchEmailHeaders,
    fetchEmailBody,
  } = useUI()

  const handleEmailClick = (email: EmailData) => {
    try {
      fetchEmailBody(selectedFolder, email.messageId)
    } catch (error) {
      console.error('An error occurred while fetching the email body:', error)
    }
  }

  const handleLoadMore = () => {
    try {
      fetchEmailHeaders(selectedFolder)
    } catch (error) {
      console.error('An error occurred while fetching the email headers:', error)
    }
  }

  return (
    <section
      className={classNames(
        'relative flex flex-col items-start justify-start w-full lg:w-1/3 h-screen overflow-y-scroll border-r bg-white',
        !!selectedEmail || !emailBodyLoaded ? 'hidden lg:flex' : '',
      )}
    >
      {!emailHeadersLoaded && <LoadingState />}
      {selectedFolder && (
        <>
          <div
            className="flex-row items-center justify-start hidden w-full h-20 px-6 py-4 border-b xl:flex"
            style={{ minHeight: '5rem' }}
          >
            {selectedFolder === 'INBOX' ? (
              <IoFileTrayFull className="flex-shrink-0 mr-3 w-7 h-7 text-slate-700" aria-hidden="true" />
            ) : (
              <IoFolderOutline className="flex-shrink-0 mr-3 w-7 h-7 text-slate-700" aria-hidden="true" />
            )}
            <h1 className="text-xl font-bold tracking-wide">{selectedFolder === 'INBOX' ? 'Inbox' : selectedFolder}</h1>
          </div>
          <ul className="flex flex-col items-start justify-start w-full h-full overflow-y-scroll">
            {emails.map((email, index) => (
              <li
                key={'email-' + index}
                className={classNames(
                  'flex flex-row w-full hover:bg-slate-100 transition-all duration-300 cursor-pointer',
                  email.messageId === selectedEmail?.messageId ? 'bg-blue-100' : 'bg-white',
                )}
                onClick={() => handleEmailClick(email)}
              >
                <div className="w-full px-6 py-5 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold leading-normal text-gray-900 line-clamp-1">
                      {email.from}
                    </span>
                    <span className="text-sm leading-none text-gray-500 whitespace-nowrap">
                      {email.date && <TimeAgo date={email.date} />}
                    </span>
                  </div>
                  <span className="text-sm leading-6 text-gray-700 line-clamp-1">{email.subject}</span>
                </div>
              </li>
            ))}
            {emailHeadersLoaded && emails.length > 0 && (
              <li className="flex items-center justify-center w-full p-4">
                <button
                  className="w-full h-12 font-semibold tracking-wide text-white uppercase bg-blue-500 rounded-full"
                  onClick={handleLoadMore}
                >
                  Load More
                </button>
              </li>
            )}
            {emailHeadersLoaded && emails.length === 0 && (
              <EmptyState title="No emails" description="There are no emails in this folder." />
            )}
          </ul>
        </>
      )}
    </section>
  )
}
