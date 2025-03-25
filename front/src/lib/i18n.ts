import { derived, writable } from 'svelte/store'

export enum Locale {
  en = 'en',
  fr = 'fr',
}

export let localeStore = writable<Locale>(Locale.en)
let translations = writable<Record<string, string>>({})

localeStore.subscribe(async ($locale) => {
  translations.set(
    (await (await fetch(`/lang/${$locale}.json`)).json()) as Record<
      string,
      string
    >,
  )
  document.documentElement.setAttribute('lang', $locale)
  document.cookie = `lang=${$locale};path=/`
})

export const t = derived(
  [localeStore, translations],
  ([$locale, $translations]) =>
    (
      key: string,
      options: {
        values?: Record<string, string>
        defaultValue: string
      },
    ) => {
      let text = $translations[key]
      if (!text) {
        console.warn(`no translation found for ${$locale}.${key}`)
        if (options.defaultValue) return options.defaultValue
        throw new Error(`no translation found for ${$locale}.${key}`)
      }

      // Replace any passed in variables in the translation string.
      Object.keys(options.values ?? {}).map((k) => {
        const regex = new RegExp(`{${k}}`, 'g')
        text = text.replace(regex, (options.values ?? {})[k])
      })

      return text
    },
)
