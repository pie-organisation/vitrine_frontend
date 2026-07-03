import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'md' | 'lg'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  const maxW = size === 'lg' ? 'max-w-xl' : 'max-w-md'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(26,16,64,0.3)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className={`w-full ${maxW} rounded-[20px] p-8 relative my-auto`}
        style={{
          background: '#fff',
          boxShadow: '0 24px 80px rgba(107,79,224,0.18)',
          border: '1px solid rgba(107,79,224,0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-display font-bold text-xl"
            style={{ color: '#1a1040', letterSpacing: '-0.5px' }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border-none"
            style={{ background: 'rgba(107,79,224,0.07)', color: 'rgba(30,15,70,0.5)' }}
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
