import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <section className="shell empty">
      <h1>Ez az oldal nem található</h1>
      <p>
        Lehet, hogy a cikk új címet kapott, vagy törölték. Nézz körül a{' '}
        <Link href="/">főoldalon</Link>.
      </p>
    </section>
  )
}
