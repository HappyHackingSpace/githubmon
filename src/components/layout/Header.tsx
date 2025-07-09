import { RateLimitWarning } from "../common/RateLimitWarning";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
      <div className="font-semibold">Genel Bakış</div>
      <RateLimitWarning />
      <div className="flex items-center space-x-3">
        <input 
          type="text" 
          placeholder="Repo veya kullanıcı ara..." 
          className="py-1.5 pl-9 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-64"
        />
      </div>
    </header>
  )
}