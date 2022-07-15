interface EmailConnection {
  type: 'IMAP' | 'POP3'
  user: string
  password: string
  host: string
  port: number
  encryption?: 'Unencrypted' | 'SSL/TLS' | 'STARTTLS'
}

interface EmailData {
  messageId: string
  html?: string
  text?: string
  subject?: string
  date?: Date
  from?: string
}

interface EmailInbox {
  folders: string[]
  selectedFolder: string
  emails: EmailData[]
  selectedEmail: EmailData | null
}

interface UIContextState {
  auth: EmailConnection
  isAuthenticated: boolean
  displaySidebar: boolean
  inbox: EmailInbox
  emailHeadersLoaded: boolean
  emailBodyLoaded: boolean
}

type UIContextAction =
  | { type: 'SET_GLOBAL_STATE'; payload: UIContextState }
  | { type: 'SET_DISPLAY_SIDEBAR'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_AUTH_CREDENTIALS'; payload: EmailConnection }
  | { type: 'SET_FOLDERS'; payload: string[] }
  | { type: 'SET_SELECTED_FOLDER'; payload: string }
  | { type: 'SET_EMAILS'; payload: EmailData[] }
  | { type: 'SET_SELECTED_EMAIL'; payload: EmailData | null }
  | { type: 'SET_EMAIL_HEADERS_LOADED'; payload: boolean }
  | { type: 'SET_EMAIL_BODY_LOADED'; payload: boolean }
