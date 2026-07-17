'use client'

import React, { useEffect, useState } from 'react'

/**
 * Űrlap-építős űrlap megjelenítése a látogatóknak. Az űrlap definícióját
 * azonosító alapján tölti be (így a szerkesztő módosításai azonnal élnek,
 * nem egy elmentett másolat jelenik meg). Beküldés: /api/urlap.
 */

type FormFieldDef = {
  id?: string
  label: string
  fieldType: 'text' | 'email' | 'textarea' | 'select' | 'checkbox'
  required?: boolean | null
  options?: string | null
}

type FormDef = {
  id: number
  name: string
  fields: FormFieldDef[]
  submitLabel?: string | null
  successMessage?: string | null
}

export function FormRenderer({ formId }: { formId: number | null | undefined }) {
  const [form, setForm] = useState<FormDef | null>(null)
  const [status, setStatus] = useState<'loading' | 'idle' | 'sending' | 'sent' | 'error' | 'missing'>(
    'loading',
  )

  useEffect(() => {
    if (!formId) return
    let aktiv = true
    fetch(`/api/forms/${formId}?depth=0`)
      .then((res) => (res.ok ? res.json() : null))
      .then((doc) => {
        if (!aktiv) return
        if (doc?.id) {
          setForm(doc as FormDef)
          setStatus('idle')
        } else {
          setStatus('missing')
        }
      })
      .catch(() => aktiv && setStatus('missing'))
    return () => {
      aktiv = false
    }
  }, [formId])

  if (!formId) return null
  if (status === 'loading') return <p className="b-form-loading">Űrlap betöltése…</p>
  if (status === 'missing' || !form) return null

  if (status === 'sent') {
    return <p className="b-contact-success">{form.successMessage || 'Köszönjük! Hamarosan válaszolunk.'}</p>
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const el = event.currentTarget
    const formData = new FormData(el)
    const values: Record<string, string | boolean> = {}
    for (const field of form.fields) {
      values[field.label] =
        field.fieldType === 'checkbox'
          ? formData.get(field.label) === 'on'
          : String(formData.get(field.label) ?? '')
    }
    setStatus('sending')
    try {
      const res = await fetch('/api/urlap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: form.id,
          values,
          website: formData.get('website'),
          path: window.location.pathname,
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      el.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const opciok = (field: FormFieldDef) =>
    String(field.options ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

  return (
    <form className="b-contact-form" onSubmit={onSubmit}>
      {form.fields.map((field, i) => {
        const key = field.id ?? `${field.label}-${i}`
        if (field.fieldType === 'checkbox') {
          return (
            <label key={key} className="b-form-checkbox">
              <input type="checkbox" name={field.label} required={Boolean(field.required)} />
              <span>{field.label}</span>
            </label>
          )
        }
        if (field.fieldType === 'select') {
          return (
            <label key={key}>
              {field.label}
              <select name={field.label} required={Boolean(field.required)} defaultValue="">
                <option value="" disabled>
                  Válassz…
                </option>
                {opciok(field).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          )
        }
        if (field.fieldType === 'textarea') {
          return (
            <label key={key}>
              {field.label}
              <textarea name={field.label} required={Boolean(field.required)} maxLength={5000} rows={6} />
            </label>
          )
        }
        return (
          <label key={key}>
            {field.label}
            <input
              type={field.fieldType === 'email' ? 'email' : 'text'}
              name={field.label}
              required={Boolean(field.required)}
              maxLength={field.fieldType === 'email' ? 254 : 1000}
              autoComplete={field.fieldType === 'email' ? 'email' : undefined}
            />
          </label>
        )
      })}
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
        {status === 'sending' ? 'Küldés…' : form.submitLabel || 'Küldés'}
      </button>
      {status === 'error' && (
        <p className="b-contact-error" role="alert">
          A küldés nem sikerült. Próbáld újra egy kicsit később.
        </p>
      )}
    </form>
  )
}
