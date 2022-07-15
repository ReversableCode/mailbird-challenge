import { FieldError } from 'react-hook-form'
import { IoCloseCircleOutline } from 'react-icons/io5'
import classNames from 'classnames'

interface TextInputProps {
  id: string
  fieldName: string
  required?: boolean
  variant?: 'small' | 'full'

  [x: string]: any

  register?: any
  error?: FieldError
}

export default function TextInput({
  id,
  fieldName,
  required,
  variant = 'full',

  register,
  error,

  ...attributes
}: TextInputProps) {
  return (
    <div className={classNames(variant === 'full' ? 'col-span-2' : 'col-span-1', 'w-full flex flex-col')}>
      {fieldName && (
        <label htmlFor={id} className="block pb-2 text-xs font-semibold text-gray-800">
          {fieldName} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={id}
        type="text"
        className={classNames(
          error
            ? 'placeholder-red-300 text-red-400 border-red-300'
            : 'placeholder-gray-500 text-gray-800 border-gray-300',
          'border px-3 py-3 bg-transparent rounded text-sm focus:outline-none focus:border-blue-500 !resize-none',
        )}
        {...attributes}
        {...register}
      />
      {error && (
        <div className="flex items-center justify-between pt-1 text-red-400">
          <p className="text-xs">{error.message}</p>
          <IoCloseCircleOutline className="w-4 h-4 m-0" />
        </div>
      )}
    </div>
  )
}
