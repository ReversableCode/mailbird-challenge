import { useUI } from '../../contexts/ui.context'

export default function ConnectionStatus() {
  const { auth, isAuthenticated } = useUI()

  return (
    <div className="w-full px-4 mt-8">
      {isAuthenticated && (
        <div className="flex flex-col items-center justify-center w-full h-16 gap-2 px-4 border rounded-lg shadow-sm border-emerald-500">
          <div className="flex items-center justify-between w-full gap-2 flow-row">
            <span className="text-xs font-semibold leading-tight">{auth.host + ':' + auth.port}</span>
            <span className="text-xs font-semibold leading-tight">{auth.encryption}</span>
          </div>
          <div className="flex items-center justify-between w-full gap-2 flow-row">
            <span className="text-xs font-semibold leading-tight">{auth.user}</span>
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  )
}
