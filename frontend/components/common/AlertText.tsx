import classNames from 'classnames'
import {
  IoCheckmarkCircleSharp,
  IoWarningSharp,
  IoInformationCircleSharp,
  IoCloseCircleSharp,
  IoClose,
} from 'react-icons/io5'

interface AlertTextProps {
  variant: 'success' | 'error' | 'warning' | 'info'
  message: string

  close: () => void
}

export default function AlertText({ variant, message, close }: AlertTextProps) {
  return (
    <div
      className={classNames(
        'rounded-md p-4',
        variant === 'success' && 'bg-green-50',
        variant === 'error' && 'bg-red-50',
        variant === 'warning' && 'bg-yellow-50',
        variant === 'info' && 'bg-blue-50',
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {variant === 'success' && <IoCheckmarkCircleSharp className="w-5 h-5 text-green-400" aria-hidden="true" />}
          {variant === 'error' && <IoCloseCircleSharp className="w-5 h-5 text-red-400" aria-hidden="true" />}
          {variant === 'warning' && <IoWarningSharp className="w-5 h-5 text-yellow-400" aria-hidden="true" />}
          {variant === 'info' && <IoInformationCircleSharp className="w-5 h-5 text-blue-400" aria-hidden="true" />}
        </div>
        <div className="ml-3">
          <p
            className={classNames(
              'text-sm font-medium',
              variant === 'success' && 'text-green-800',
              variant === 'error' && 'text-red-800',
              variant === 'warning' && 'text-yellow-800',
              variant === 'info' && 'text-blue-800',
            )}
          >
            {message}
          </p>
        </div>
        <div className="pl-3 ml-auto">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              className={classNames(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                variant === 'success' &&
                  'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-offset-green-50 focus:ring-green-600',
                variant === 'error' &&
                  'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-offset-red-50 focus:ring-red-600',
                variant === 'warning' &&
                  'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-offset-yellow-50 focus:ring-yellow-600',
                variant === 'info' &&
                  'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-offset-blue-50 focus:ring-blue-600',
              )}
              onClick={close}
            >
              <span className="sr-only">Dismiss</span>
              <IoClose className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
