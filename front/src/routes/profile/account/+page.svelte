<script lang="ts">
import { onDestroy } from 'svelte'

import { Api, FormError } from '$lib/api'
import Input from '$lib/components/form/Input.svelte'
import Toast from '$lib/components/Toast.svelte'
import { t } from '$lib/i18n'
import { currentUserStore, toast } from '$lib/store'

interface UsernameFormData {
  username: string
}
interface EmailFormData {
  email: string
}
let loading = $state<string | null>(null)
let usernameFormData = $state<UsernameFormData>({ username: '' })
let emailFormData = $state<EmailFormData>({ email: '' })
let errors = $state<any>()

async function onSubmitEmail(evt: Event) {
  evt.preventDefault()
  loading = 'email'
  try {
    await Api.patchUserEmail(emailFormData)
    toast.set({
      show: true,
      message: $t('profile.account.toast', {
        defaultValue: 'Profile updated successfully',
      }),
      type: 'success',
    })
    setTimeout(() => toast.set({ show: false, message: '', type: '' }), 2000)
  } catch (err) {
    if (err instanceof FormError) errors = err.errors as FormData
  }
  loading = null
}
async function onSubmitUsername(evt: Event) {
  evt.preventDefault()
  loading = 'username'
  try {
    await Api.patchUserUsername(usernameFormData)
    toast.set({
      show: true,
      message: $t('profile.account.toast', {
        defaultValue: 'Profile updated successfully',
      }),
      type: 'success',
    })
    setTimeout(() => toast.set({ show: false, message: '', type: '' }), 2000)
  } catch (err) {
    if (err instanceof FormError) errors = err.errors as FormData
  }
  loading = null
}

onDestroy(
  currentUserStore.subscribe((v) => {
    usernameFormData.username = v?.username ?? ''
    emailFormData.email = v?.email ?? ''
  }),
)
</script>

<div class="w-full">
  <h2 class="text-2xl mb-4">
    {$t('profile.account.title-email', { defaultValue: 'Change Email' })}
  </h2>
  <form class="flex flex-col gap-4" onsubmit={onSubmitEmail}>
    <Input
      id="email"
      type="email"
      required={true}
      bind:value={emailFormData.email}
      errors={errors?.email}
    />
    <button type="submit" class="btn btn-primary" disabled={loading === 'email'}>
      {#if loading === 'email'}
        <span class="loading loading-spinner loading-md"></span>
      {:else}
        {$t('profile.account.submit', { defaultValue: 'save' })}
      {/if}
    </button>
  </form>
</div>
<div class="divider"></div>
<div class="w-full">
  <h2 class="text-2xl mb-4">
    {$t('profile.account.title-username', { defaultValue: 'Change Username' })}
  </h2>
  <form class="flex flex-col gap-4" onsubmit={onSubmitUsername}>
    <Input
      id="username"
      type="text"
      required={true}
      bind:value={usernameFormData.username}
      errors={errors?.username}
    />
    <button type="submit" class="btn btn-primary" disabled={loading === 'username'}>
      {#if loading === 'username'}
        <span class="loading loading-spinner loading-md"></span>
      {:else}
        {$t('profile.account.submit', { defaultValue: 'save' })}
      {/if}
    </button>
  </form>
</div>

<Toast type={$toast.type} message={$toast.message} show={$toast.show} />
