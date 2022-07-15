import { useState } from 'react'
import { useForm } from 'react-hook-form'
import classNames from 'classnames'

import { useUI } from '../contexts/ui.context'

import AlertText from './common/AlertText'
import ListInput from './common/inputs/ListInput'
import TextInput from './common/inputs/TextInput'
import NumberInput from './common/inputs/NumberInput'
import BaseModalLayout, { ModalSubmitButton } from './common/BaseModalLayout'

export default function AuthenticationModal() {
  const { isAuthenticated, authenticate } = useUI()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailConnection>()

  const onSubmit = async (formData: EmailConnection) => {
    setIsLoading(true)

    try {
      await authenticate(formData)
    } catch (error: any) {
      setError(error.message)
    }

    setIsLoading(false)
  }

  return (
    <BaseModalLayout
      isOpen={!isAuthenticated}
      setIsOpen={() => {}}
      title="Welcome to the Webmail App"
      description="Please enter your email connection details"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={classNames(isLoading && 'cursor-not-allowed pointer-events-none opacity-40')}
      >
        <div className={classNames(isLoading && 'pointer-events-none opacity-50', 'mt-6 px-2')}>
          <div className="grid w-full grid-cols-1 gap-4 mb-6">
            <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
              <ListInput
                id="type"
                fieldName="Server Type"
                variant="small"
                options={['IMAP', 'POP3']}
                required={true}
                defaultValue="IMAP"
                error={errors.type}
                register={register('type', {
                  required: 'Please select a server type',
                })}
              />
              <ListInput
                id="encryption"
                fieldName="Encryption"
                variant="small"
                options={['Unencrypted', 'SSL/TLS', 'STARTTLS']}
                defaultValue="Unencrypted"
                error={errors.encryption}
                register={register('encryption')}
              />
            </div>
            <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
              <TextInput
                id="host"
                fieldName="Server Host"
                variant="small"
                required={true}
                error={errors.host}
                register={register('host', {
                  required: 'Please enter a server host',
                })}
              />
              <NumberInput
                id="port"
                fieldName="Server Port"
                variant="small"
                required={true}
                min={1}
                error={errors.port}
                register={register('port', {
                  required: 'Please enter a server port',
                  valueAsNumber: true,
                })}
              />
            </div>
            <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
              <TextInput
                id="user"
                fieldName="Username"
                variant="small"
                required={true}
                error={errors.user}
                register={register('user', {
                  required: 'Please enter a username',
                })}
              />
              <TextInput
                id="password"
                fieldName="Password"
                variant="small"
                type="password"
                required={true}
                error={errors.password}
                register={register('password', {
                  required: 'Please enter a password',
                })}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="w-full mb-6">
            <AlertText variant="error" message={error} close={() => setError('')} />
          </div>
        )}

        <div className="w-full">
          <div className="flex justify-center w-full">
            <ModalSubmitButton text="Start" loading={isLoading} />
          </div>
        </div>
      </form>
    </BaseModalLayout>
  )
}
