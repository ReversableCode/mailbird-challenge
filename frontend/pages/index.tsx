import EmailBody from '../components/EmailBody'
import EmailList from '../components/EmailList'
import InboxLayout from '../layouts/inbox.layout'

export default function HomePage() {
  return (
    <InboxLayout>
      <div className="flex flex-row justify-start w-full h-full">
        <EmailList />
        <EmailBody />
      </div>
    </InboxLayout>
  )
}
