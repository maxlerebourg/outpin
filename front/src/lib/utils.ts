/* eslint-disable @typescript-eslint/no-explicit-any */
import { PUBLIC_POCKETBASE_URL } from '$env/static/public'

export function getImageURL(
  collectionId: unknown,
  recordId: unknown,
  fileName: unknown,
  size = '0x0',
) {
  return `${PUBLIC_POCKETBASE_URL}/api/files/${collectionId}/${recordId}/${fileName}?thumb=${size}`
}

export function toSlug(str: string) {
  return str
    .toString()
    .normalize('NFD') // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '') // remove all chars not letters, numbers and spaces (to be replaced)
    .replace(/\s+/g, '-') // separator
}

export function clickOutside(element: Element, callback: () => void) {
  function onClick(event: Event) {
    if (event?.target && !element.contains(event.target as Node)) {
      callback()
    }
  }
  document.body.addEventListener('click', onClick)
  return {
    update: (newCallback: () => void) => (callback = newCallback),
    destroy: () => document.body.removeEventListener('click', onClick),
  }
}

export function formatDate(str: string) {
  return new Date(str).toLocaleDateString(undefined, {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
  })
}

export function formatDatetime(str: string) {
  return new Date(str).toLocaleString(undefined, {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
