import { pb } from '$lib/api'
import { currentUserStore } from '$lib/store'
import { Locale, localeStore } from '$lib/i18n'

const lang = window.navigator.language as Locale
const desiredLang = (document.cookie
  .split(';')
  .filter((c) => /lang=/.test(c))?.[0]
  ?.split('=')[1]
  ?.trim() ?? lang) as Locale
if (Locale[desiredLang] && desiredLang !== Locale.en)
  localeStore.set(desiredLang)

pb.authStore.loadFromCookie(document.cookie)
pb.authStore.onChange(() => {
  currentUserStore.set(
    pb.authStore.record
      ? {
          ...pb.authStore.record,
          email: pb.authStore.record.email,
          username: pb.authStore.record.name,
        }
      : null,
  )
  document.cookie = pb.authStore.exportToCookie({ httpOnly: false })
}, true)

export const handleError = () => undefined
export const init = () => undefined
