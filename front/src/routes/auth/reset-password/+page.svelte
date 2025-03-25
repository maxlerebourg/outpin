<script lang="ts">
import { Api, FormError } from '$lib/api'
import Input from '$lib/components/form/Input.svelte'
import { t } from '$lib/i18n'

let loading = $state(false)
let success = $state(false)
let auth = $state<Partial<Auth>>({ email: '' })
let errors = $state<Partial<Auth>>()
</script>

<form
  class="card max-w-sm sm:mt-10 mx-auto transition-all duration-300 ease-in-out"
  onsubmit={async (evt: Event) => {
    evt.preventDefault()
    loading = true
    try {
      await Api.forgotPassword(auth)
      success = true
    } catch (err) {
      if (err instanceof FormError) errors = err.errors as Auth
    }
    loading = false
  }}
>
  <div class="mb-2">
    <h1 class="text-4xl">{$t('reset-password.title', { defaultValue: "Reset password"})}</h1>

    <p class="pt-2">
      {$t('reset-password.request-password-reset', { defaultValue: "Request a password reset link to be e-mailed to you."})}
    </p>
  </div>
  <div class="form-control flex flex-col gap-4 mb-4">
    <Input
      type="email"
      id="email"
      placeholder={$t('reset-password.input-email-placeholder', { defaultValue: "Email"})}
      bind:value={auth.email}
      errors={errors?.email}
    />
  </div>
  <button type="submit" class="btn btn-primary" disabled={loading}>
    {#if loading}
      <span class="loading loading-spinner loading-md"></span>
    {:else}
      {$t('reset-password.submit', { defaultValue: "send"})}
    {/if}
  </button>

  {#if success}
    <div class="alert alert-success my-5">
      <div class="flex gap-2 items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current flex-shrink-0 h-7 w-7 animate-pulse"
          fill="none"
          viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          /></svg
        >
        <span>{$t('reset-password.success-alert', { defaultValue: "An email has been sent to reset your password!"})}</span>
      </div>
    </div>
  {/if}
</form>
