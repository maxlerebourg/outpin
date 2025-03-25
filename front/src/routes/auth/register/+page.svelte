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
      await Api.register(auth)
      await Api.login(auth)
      goto('/')
    } catch (err) {
      if (err instanceof FormError) errors = err.errors as Auth
    }
    loading = false
  }}
>
  <div class="mb-2">
    <h1 class="text-4xl">{$t('register.title', { defaultValue: "Register"})}</h1>
    <p class=" pt-2">
      {$t('register.subtitle-1', { defaultValue: "Or"})}
      <a href="/auth/login" class="underline text-primary">
        {$t('register.subtitle-2', { defaultValue: "login"})}
      </a>
      {$t('register.subtitle-3', { defaultValue: "if you have an account."})}
    </p>
  </div>
  <div class="form-control flex flex-col gap-4 mb-4">
    <Input
      type="email"
      id="email"
      placeholder={$t('register.input-email', { defaultValue: "Email"})}
      bind:value={auth.email}
      errors={errors?.email}
    />
    <Input
      type="password"
      id="password"
      placeholder={$t('register.input-password', { defaultValue: "Password"})}
      bind:value={auth.password}
      errors={errors?.password}
    />
    <div class="alert border border-primary mb-4 text-sm">
      <div class="text-left">
        {$t('register.alert', { defaultValue: 'Your password will be encrypted for your safety, it will not be readable by anyone.'})}
      </div>
    </div>

    <button type="submit" class="btn btn-primary" disabled={loading}>
      {#if loading}
        <span class="loading loading-spinner loading-md"></span>
      {:else}
        {$t('register.submit', { defaultValue: "register"})}
      {/if}
    </button>
  </div>
</form>
