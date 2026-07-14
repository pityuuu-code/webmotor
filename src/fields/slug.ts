import type { Field } from 'payload'

/** Magyar ékezetes szövegből URL-barát slugot készít (pl. "Őszi túrák" -> "oszi-turak"). */
export const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Slug mező gyárfüggvény. A megadott forrásmezőből (alapból: title)
 * automatikusan generálja az URL-t, de kézzel is felülírható.
 */
export const slugField = (sourceField = 'title'): Field => ({
  name: 'slug',
  label: 'URL (slug)',
  type: 'text',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Üresen hagyva a címből generálódik. Csak kisbetű, szám és kötőjel.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim() !== '') return slugify(value)
        const source = data?.[sourceField]
        if (typeof source === 'string' && source.trim() !== '') return slugify(source)
        return value
      },
    ],
  },
})
