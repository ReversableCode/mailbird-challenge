import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import classnames from 'classnames'

interface BaseModalLayoutProps {
  title?: string
  description?: string

  isOpen: boolean
  setIsOpen: (x: boolean) => void

  initialFocus?: any
  small?: boolean
}

interface ModalSubmitButtonProps {
  text?: string
  type?: 'danger' | 'blue'
  isDisabled?: boolean
  loading: boolean

  onClick?: () => void
}

interface ModalCancelButtonProps {
  buttonRef?: any
  text?: string
  closeModal: () => void
}

export default function BaseModalLayout({
  isOpen,
  setIsOpen,
  title,
  description,
  children,
  initialFocus,
  small = false,
}: React.PropsWithChildren<BaseModalLayoutProps>) {
  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          initialFocus={initialFocus || undefined}
          className="fixed inset-0 z-30 overflow-y-auto"
          onClose={() => setIsOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-150"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 overflow-y-auto">
                <div className="fixed inset-0 bg-slate-900 bg-opacity-60" />
                <div className="flex items-center justify-center min-h-full p-4 text-center">
                  <div
                    className={classnames(
                      small ? 'max-w-lg' : 'max-w-3xl',
                      'inline-block w-full p-6 my-8 text-left align-middle transition-all transform bg-white shadow-lg rounded-lg',
                    )}
                  >
                    {title && (
                      <Dialog.Title as="h3" className="px-2 pb-1 text-lg font-semibold leading-none text-gray-900">
                        {title}
                      </Dialog.Title>
                    )}
                    {description && <p className="w-full px-2 mb-4 text-xs leading-4 text-gray-600">{description}</p>}

                    {children}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export function ModalSubmitButton(props: ModalSubmitButtonProps) {
  return (
    <button
      type={props.isDisabled || props.onClick ? 'button' : 'submit'}
      className={classnames(
        props.isDisabled === true && 'opacity-50 cursor-not-allowed',
        props.type === 'danger' ? 'bg-red-500 hover:bg-red-400' : 'bg-blue-500 hover:bg-blue-400',
        'inline-flex justify-center px-8 py-2 text-sm font-medium border border-transparent rounded-md text-white focus:outline-none transition-colors duration-150 gap-3 items-center',
      )}
      disabled={props.loading}
      onClick={props.onClick || undefined}
    >
      {props.text || 'Confirmer'}
      {props.loading && (
        <svg
          className="inline-flex w-4 h-4 text-white animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
    </button>
  )
}

export function ModalCancelButton(props: ModalCancelButtonProps) {
  return (
    <div
      ref={props.buttonRef || undefined}
      onClick={props.closeModal}
      className="px-8 py-3 ml-3 text-sm text-blue-500 transition duration-150 ease-in-out rounded cursor-pointer focus:outline-none"
    >
      {props.text || 'Annuler'}
    </div>
  )
}
