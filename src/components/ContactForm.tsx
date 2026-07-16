'use client'

import React, { useState } from 'react'

/**
 * Kapcsolatűrlap – az oldalépítő "Kapcsolatűrlap" szekciója használja.
 * A beküldött üzenetek az adminban jelennek meg (Beérkezett üzenetek).
 * Spam-védelem: rejtett "honlap" mező – ember nem látja, a botok kitöltik.
 */
export function ContactForm({ successMessage }: { successMessage?: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setStatus('sending')
    try {
      const res = await fetch('/api/kapcsolat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message'),
          website: formData.get('website'),
          path: window.location.pathname,
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return <p className="b-contact-success">{successMessage || 'Köszönjük! Hamarosan válaszolunk.'}</p>
  }

  return (
    <form className="b-contact-form" onSubmit={onSubmit}>
      <label>
        Név
        <input type="text" name="name" required maxLength={200} autoComplete="name" />
      </label>
      <label>
        E-mail-cím
        <input type="email" name="email" required maxLength={254} autoComplete="email" />
      </label>
      <label>
        Üzenet
        <textarea name="message" required maxLength={5000} rows={6} />
      </label>
      {/* Honeypot: emberi látogató nem látja, ha ki van töltve, a beküldést eldobjuk. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="b-contact-honeypot"
      />
      <button type="submit" className="button" disabled={status === 'sending'}>
        {status === 'sending' ? 'Küldés…' : 'Üzenet küldése'}
      </button>
      {status === 'error' && (
        <p className="b-contact-error" role="alert">
          A küldés nem sikerült. Próbáld újra egy kicsit később.
        </p>
      )}
    </form>
  )
}
