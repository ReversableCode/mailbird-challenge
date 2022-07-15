import React from 'react'

// Initial state of the UI context
const initialState: UIContextState = {
  auth: {
    type: 'IMAP',
    user: '',
    password: '',
    host: '',
    port: 993,
    encryption: 'Unencrypted',
  },
  isAuthenticated: false,
  displaySidebar: false,
  inbox: {
    folders: ['INBOX'],
    selectedFolder: '',
    emails: [],
    selectedEmail: null,
  },
  emailHeadersLoaded: true,
  emailBodyLoaded: true,
}

export const UIContext = React.createContext<any>({})

UIContext.displayName = 'UIContext'

/**
 * A Reducer to handle actions on the UI state
 * @param state current state of the UI
 * @param action action to be performed on the state
 * @returns new state of the UI
 */
function uiReducer(state: UIContextState, action: UIContextAction) {
  switch (action.type) {
    case 'SET_GLOBAL_STATE':
      return action.payload
    case 'SET_DISPLAY_SIDEBAR':
      return { ...state, displaySidebar: action.payload }
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload }
    case 'SET_AUTH_CREDENTIALS':
      return { ...state, auth: action.payload }
    case 'SET_FOLDERS':
      return { ...state, inbox: { ...state.inbox, folders: action.payload } }
    case 'SET_SELECTED_FOLDER':
      return {
        ...state,
        inbox: { ...state.inbox, selectedFolder: action.payload },
      }
    case 'SET_EMAILS':
      return { ...state, inbox: { ...state.inbox, emails: action.payload } }
    case 'SET_SELECTED_EMAIL':
      return {
        ...state,
        inbox: { ...state.inbox, selectedEmail: action.payload },
      }
    case 'SET_EMAIL_HEADERS_LOADED':
      return { ...state, emailHeadersLoaded: action.payload }
    case 'SET_EMAIL_BODY_LOADED':
      return { ...state, emailBodyLoaded: action.payload }
    default:
      return state
  }
}

/**
 * UI Context Provider
 * @param props The props to pass to the UI context
 */
export const UIProvider: React.FC<React.PropsWithChildren<unknown>> = (props) => {
  // Handling states and actions
  const [state, dispatch] = React.useReducer(uiReducer, initialState)
  // This down below is used for memoization of the email body for POP3 servers
  const [visitedEmails, setVisitedEmails] = React.useState<Record<string, EmailData>>({})

  const authenticate = async (auth: EmailConnection) => {
    // Authenticate with the server and get the folders
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/email/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auth),
      credentials: 'include',
    })

    // On success, set the folders and set the user as authenticated
    if (response.status === 201) {
      // Save the auth credentials to the state
      dispatch({ type: 'SET_AUTH_CREDENTIALS', payload: auth })
      dispatch({ type: 'SET_AUTHENTICATED', payload: true })

      // Save the folders to the state
      const data = await response.json()
      setFolders(data.data)

      // Reset the visited emails to empty
      setVisitedEmails({})
      setEmails([])

      // Fetch the emails from the selected folder
      setSelectedFolder('INBOX')
      fetchEmailHeaders('INBOX', true)
    } else {
      const data = await response.json()
      throw new Error(data.data)
    }
  }
  const unauthenticate = () => dispatch({ type: 'SET_AUTHENTICATED', payload: false })
  const toggleEmailHeadersLoading = (isLoading: boolean) =>
    dispatch({ type: 'SET_EMAIL_HEADERS_LOADED', payload: !isLoading })
  const toggleEmailBodyLoading = (isLoading: boolean) =>
    dispatch({ type: 'SET_EMAIL_BODY_LOADED', payload: !isLoading })
  const toggleSidebar = (isOpen: boolean) => dispatch({ type: 'SET_DISPLAY_SIDEBAR', payload: isOpen })

  const setFolders = (folders: string[]) => dispatch({ type: 'SET_FOLDERS', payload: folders })
  const setSelectedFolder = (folder: string) => dispatch({ type: 'SET_SELECTED_FOLDER', payload: folder })
  const setEmails = (emails: EmailData[]) => dispatch({ type: 'SET_EMAILS', payload: emails })
  const setSelectedEmail = (email: EmailData | null) => dispatch({ type: 'SET_SELECTED_EMAIL', payload: email })

  const fetchEmailHeaders = async (folder: string, reset?: boolean) => {
    // Toggle the loading state
    toggleEmailHeadersLoading(true)

    try {
      // Fetch the email headers from the API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/email/${folder}/fetch-headers?limit=25&skip=${state.inbox.emails.length}`,
        {
          credentials: 'include',
        },
      )

      // On success, set the emails to the state
      if (response.status === 200) {
        // Save the emails to the state
        const data = await response.json()
        if (reset) {
          setEmails(data.data)
        } else {
          setEmails([...state.inbox.emails, ...data.data])
        }
      } else {
        const data = await response.json()
        throw new Error(data.data)
      }

      // Toggle the loading state
      toggleEmailHeadersLoading(false)
    } catch (error) {
      toggleEmailHeadersLoading(false)
      throw error
    }
  }
  const fetchEmailBody = async (folder: string, emailId: string) => {
    // Check if the email has been visited before, if so, don't fetch it again
    if (state.auth.type === 'POP3' && visitedEmails[emailId]) {
      setSelectedEmail(visitedEmails[emailId])
      return
    }

    // Toggle the loading state
    toggleEmailBodyLoading(true)

    try {
      // Fetch the email body from the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/email/${folder}/${emailId}/fetch-body`, {
        credentials: 'include',
      })

      // On success, save the email to the visited emails state
      if (response.status === 200) {
        // Save the email body to the state
        const data = await response.json()
        setSelectedEmail(data.data)
        setVisitedEmails({ ...visitedEmails, [emailId]: data.data })
      } else {
        const data = await response.json()
        throw new Error(data.data)
      }

      // Toggle the loading state
      toggleEmailBodyLoading(false)
    } catch (error) {
      toggleEmailBodyLoading(false)
      throw error
    }
  }

  const value = React.useMemo(
    () => ({
      ...state,
      authenticate,
      unauthenticate,
      toggleEmailHeadersLoading,
      toggleEmailBodyLoading,
      toggleSidebar,
      setFolders,
      setSelectedFolder,
      setEmails,
      setSelectedEmail,
      fetchEmailHeaders,
      fetchEmailBody,
    }),
    [state], // eslint-disable-line react-hooks/exhaustive-deps
  )

  return <UIContext.Provider value={value} {...props} />
}

/**
 * A wrapper for the UI context to be used as a hook.
 */
export const useUI = () => {
  const context: {
    authenticate: (auth: EmailConnection) => Promise<void>
    unauthenticate: () => void
    toggleEmailHeadersLoading: (isLoading: boolean) => void
    toggleEmailBodyLoading: (isLoading: boolean) => void
    toggleSidebar: (isOpen: boolean) => void
    setFolders: (folders: string[]) => void
    setSelectedFolder: (folder: string) => void
    setEmails: (emails: EmailData[]) => void
    setSelectedEmail: (email: EmailData | null) => void
    fetchEmailHeaders: (folder: string, reset?: boolean) => Promise<void>
    fetchEmailBody: (folder: string, emailId: string) => Promise<void>
    auth: EmailConnection
    isAuthenticated: boolean
    displaySidebar: boolean
    inbox: EmailInbox
    emailHeadersLoaded: boolean
    emailBodyLoaded: boolean
  } = React.useContext(UIContext)
  if (context === undefined) {
    throw new Error(`useUI must be used within a UIProvider`)
  }
  return context
}

/**
 * A wrapper for the UIProvider that provides the UI context.
 */
export const ManagedUIContext: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => (
  <UIProvider>{children}</UIProvider>
)
