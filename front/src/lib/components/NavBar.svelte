<script lang="ts">
import { onDestroy, onMount } from 'svelte'
import { currentUserStore } from '$lib/store'
import Icon from './Icon.svelte'
import { Locale, localeStore, t } from '$lib/i18n'

let locale = $state<Locale>(Locale.en)
let theme = $state<string>('dark')
let currentUser = $state<User | null>()

function toggleDarkMode() {
  const attribute = document.documentElement.getAttribute('data-theme')
  theme = attribute === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}
function changeLang(lang: Locale) {
  localeStore.set(lang)
  const langInput = document.getElementById('lang') as HTMLInputElement
  if (langInput) langInput.checked = false
}

onMount(() => {
  if (typeof localStorage !== 'undefined') {
    theme = localStorage.getItem('theme') ?? 'dark'
    if (theme === 'light')
      document.documentElement.setAttribute('data-theme', 'light')
  }
  const el = document.getElementById('swap')
  if (el) el.addEventListener('change', () => toggleDarkMode())
})

const localeUnsubscribe = localeStore.subscribe((v) => (locale = v))
const currentUserUnsubscribe = currentUserStore.subscribe(
  (v) => (currentUser = v),
)
onDestroy(() => {
  localeUnsubscribe()
  currentUserUnsubscribe()
})
</script>

<div class="relative z-100 bg-base-100 shadow-md">
	<div class="navbar max-w-4xl mx-auto px-4">
		<a class="btn btn-ghost px-2 text-xs md:text-3xl font-cookie" href="/">
			<img src="/logo.svg" alt="logo" class="h-8 w-8"/>
			OutPin
		</a>
		<div class="flex-1 flex items-center justify-end">
			<ul class="flex gap-1">
				{#if !currentUser}
					<li>
						<a class="btn btn-primary" href="/auth/login">{$t('navbar.login', { defaultValue: 'login' })}</a>
					</li>
					<li>
						<a class="btn" href="/auth/register">{$t('navbar.signup', { defaultValue: 'signup' })}</a>
					</li>
				{:else}
					<li>
						<a class="btn px-2" href="/adventures">{$t('navbar.adventures', { defaultValue: 'Adventures' })}</a>
					</li>
					<li>
						<a class="btn px-2 btn-square sm:btn-block" href="/profile/account">
							<Icon icon="user" _class="h-4 w-4" />
							<span class="hidden sm:inline">
								{currentUser.username || $t('navbar.account', { defaultValue: 'account' })}
							</span>
						</a>
					</li>
				{/if}
				<li>
					<label for="swap" class="btn btn-ghost btn-square swap swap-rotate">
						<input id="swap" type="checkbox">
						<svg class="swap-on fill-current"  width="25" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>
						<svg class="swap-off fill-current" width="25" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/></svg>
					</label>
				</li>
				<li>
					<label for="lang" class="btn btn-ghost btn-square relative">
						<input id="lang" type="checkbox" class="peer hidden">
						<Icon icon="locale" _class="w-6 h-6" />
						<div class="card flex-row absolute bg-base-300 z-100 top-0 right-full hidden peer-checked:flex">
							{#each Object.values(Locale) as lang}
								<button
									type="button"
									class="btn btn-ghost btn-square {locale === lang ? 'hidden' : ''}"
									onclick={() => changeLang(lang)}
								>
									{lang}
								</button>
							{/each}
						</div>
					</label>
				</li>
			</ul>
		</div>
	</div>
</div>
