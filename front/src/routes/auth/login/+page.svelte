<script lang="ts">
import { goto } from '$app/navigation'
import { Api, FormError } from '$lib/api'
import Input from '$lib/components/form/Input.svelte'
import { t } from '$lib/i18n'

let loading = $state(false)
let auth = $state<Auth>({ email: '', password: '' })
let errors = $state<Auth>()
</script>

<form
  class="card max-w-sm sm:mt-10 mx-auto transition-all duration-300 ease-in-out"
  onsubmit={async (evt: Event) => {
    evt.preventDefault()
    loading = true
    try {
      await Api.login(auth)
      goto('/')
    } catch (err) {
      if (err instanceof FormError) errors = err.errors as Auth
    }
    loading = false
  }}
>
  <div class="mb-2">
    <h1 class="text-4xl">{$t('login.title', { defaultValue: 'Login' })}</h1>
    <p class=" pt-2">
      {$t('login.subtitle-1', { defaultValue: 'Or' })}
      <a href="/auth/register" class='underline text-primary'>
        {$t('login.subtitle-2', { defaultValue: 'register' })}
      </a>
      {$t('login.subtitle-3', { defaultValue: 'to create an account.' })}
    </p>
  </div>

  <div class="form-control flex flex-col gap-4 mb-4">
    <Input
      type="email"
      id="email"
      placeholder={$t('login.input-email-placeholder', { defaultValue: 'Email' })}
      required
      bind:value={auth.email}
      errors={errors?.email}
    />
    <Input
      type="password"
      id="password"
      placeholder={$t('login.input-password-placeholder', { defaultValue: 'Password' })}
      required
      bind:value={auth.password}
      errors={errors?.password}
    />
    <div>
      <a
        href="/auth/reset-password"
        class="text-sm text-primary hover:cursor-pointer hover:underline"
      >
        {$t('login.forgot-password', { defaultValue: 'Forgot Password?' })}
      </a>
    </div>
    <button type="submit" class="btn btn-primary" disabled={loading}>
      {#if loading}
        <span class="loading loading-spinner loading-md"></span>
      {:else}
        {$t('login.submit', { defaultValue: 'login' })}
      {/if}
    </button>
  </div>
</form>
