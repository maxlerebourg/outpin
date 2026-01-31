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

<header class="relative z-100 bg-base-100 shadow-md">
	<div class="navbar max-w-4xl mx-auto px-4">
		<a class="btn btn-ghost px-2 text-xs md:text-3xl font-cookie" href="/">
			<img src="/logo.svg" alt="logo" class="h-8 w-8"/>
			OutPin
		</a>
		<div class="flex-1 flex items-center justify-end">
			<ul class="flex gap-1">
				{#if !currentUser}
					<li>
						<a class="btn btn-primary px-2" href="/auth/login">{$t('navbar.login', { defaultValue: 'login' })}</a>
					</li>
					<li>
						<a class="btn px-2" href="/auth/register">{$t('navbar.signup', { defaultValue: 'signup' })}</a>
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
					<div class="dropdown dropdown-left">
						<div tabindex="0" role="button" class="btn btn-ghost btn-square">
							<Icon icon="locale" _class="w-6 h-6" />
						</div>
						<ul class="dropdown-content card bg-base-300 flex-row z-100">
							{#each Object.values(Locale) as lang}
								<li>
									<button
										type="button"
										class="btn btn-ghost btn-square {locale === lang ? 'hidden' : ''}"
										onclick={() => changeLang(lang)}
									>
										{lang}
									</button>
								</li>
							{/each}
						</ul>
					</div>
				</li>
			</ul>
		</div>
	</div>
	
	<a
		href="https://github.com/maxlerebourg/outpin" 
		target="_blank" 
		rel="noopener noreferrer"
		class="github-corner absolute right-0 top-0 z-10 [clip-path:polygon(0%_0%,100%_0%,100%_100%)]"
		aria-label="View source on GitHub"
	>
		<svg width="45" height="45" viewBox="0 0 250 250" aria-hidden="true">
			<path class="fill-primary" d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
			<path class="fill-base-100 arm" d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" style="transform-origin: 130px 106px;" />
			<path class="fill-base-100" d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" />
		</svg>
	</a>
</header>

<style>
	.github-corner:hover .arm {
		animation: octocat-wave 560ms ease-in-out;
	}

	@keyframes octocat-wave {
		0%, 100% { transform: rotate(0) }
		20%, 60% { transform: rotate(-25deg) }
		40%, 80% { transform: rotate(10deg) }
	}
</style>
