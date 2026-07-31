import { useState } from 'react'

export default function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        className="input-line pr-10"
        value={value}
        onChange={onChange}
        required
      />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-0 top-1/2 -translate-y-1/2 text-ink-muted hover:text-accent transition-colors" aria-label="Toggle password visibility">
        <span className="material-symbols-outlined text-[20px]">{show ? 'visibility' : 'visibility_off'}</span>
      </button>
    </div>
  )
}
