<script lang="ts">
import '../app.css'
import { onDestroy, onMount } from 'svelte'
import { goto } from '$app/navigation'
import { page } from '$app/state'

import { Api } from '$lib/api'
import NavBar from '$lib/components/NavBar.svelte'
import { currentUserStore } from '$lib/store'

let { children } = $props()
let currentUser = $state<User | null>(null)

const currentUserUnsubscribe = currentUserStore.subscribe(
  (v) => (currentUser = v),
)

async function load() {
  try {
    await Api.refreshUser()
  } catch (err) {
    // Pass
  }
  if (!currentUser) {
    if (
      page.url.pathname.includes('/adventures') ||
      page.url.pathname.includes('/profile')
    ) {
      goto('/auth/login', {})
    }
  }
}
onMount(load)
onDestroy(currentUserUnsubscribe)
</script>

<NavBar />
<main>
	{@render children?.()}
</main>