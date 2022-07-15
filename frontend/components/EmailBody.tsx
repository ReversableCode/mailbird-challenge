/* eslint-disable @next/next/no-img-element */
import classNames from 'classnames'
import TimeAgo from 'react-timeago'
import { Letter } from 'react-letter'

import { useUI } from '../contexts/ui.context'

import EmptyState from './common/EmptyState'
import LoadingState from './common/LoadingState'

export default function EmailBody() {
  const {
    inbox: { selectedEmail },
    emailBodyLoaded,
  } = useUI()

  return (
    <section
      className={classNames(
        'relative flex flex-col items-start justify-start w-full lg:w-2/3 h-screen overflow-y-scroll border-r bg-white',
        !!selectedEmail || !emailBodyLoaded ? '' : 'hidden lg:flex',
      )}
    >
      {!emailBodyLoaded && <LoadingState />}
      {emailBodyLoaded && !selectedEmail && (
        <EmptyState
          title="No email selected"
          description="Please select an email from the inbox to view its contents."
        />
      )}
      {selectedEmail && (
        <>
          <div
            className="flex flex-col items-start justify-start w-full h-20 px-6 py-4 border-b"
            style={{ minHeight: '5rem' }}
          >
            <div className="flex items-center justify-between w-full">
              <h1 className="text-xl font-bold leading-normal">{selectedEmail?.subject}</h1>
              <span className="text-sm leading-none text-gray-500">
                {selectedEmail?.date && <TimeAgo date={selectedEmail?.date} />}
              </span>
            </div>
            <p className="text-xs text-gray-500">{selectedEmail?.from}</p>
          </div>
          <Letter className="w-full p-6 unreset" html={selectedEmail.html ?? ''} text={selectedEmail.text} />
        </>
      )}
    </section>
  )
}
