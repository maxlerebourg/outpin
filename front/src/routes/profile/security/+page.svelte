<script lang="ts">
import { Api, FormError } from '$lib/api'
import Input from '$lib/components/form/Input.svelte'
import Toast from '$lib/components/Toast.svelte'
import { t } from '$lib/i18n'
import { toast } from '$lib/store'

interface FormData {
  oldPassword: string
  password: string
}
let loading = $state(false)
let formData = $state<FormData>({ oldPassword: '', password: '' })
let errors = $state<FormData>()
async function onSubmit(evt: Event) {
  evt.preventDefault()
  loading = true
  try {
    await Api.patchUserPassword(formData)
    toast.set({
      show: true,
      message: $t('profile.security.toast', {
        defaultValue: 'Password updated successfully',
      }),
      type: 'success',
    })
    setTimeout(() => toast.set({ show: false, message: '', type: '' }), 2000)
  } catch (err) {
    if (err instanceof FormError) errors = err.errors as FormData
  }
  loading = false
}
</script>

<div class="w-full">
  <div class="text-2xl mb-4">{$t('profile.security.title', { defaultValue: 'Change Password' })}</div>
  <form
    class="flex flex-col gap-4"
    onsubmit={onSubmit}
  >
    <Input
      type="password"
      required
      id="password"
      placeholder={$t('profile.security.input-old-password-placeholder', { defaultValue: 'Old Password' })}
      bind:value={formData.oldPassword}
      errors={errors?.oldPassword}
    />
    <Input
      type="password"
      id="password"
      required
      placeholder={$t('profile.security.input-password-placeholder', { defaultValue: 'Password' })}
      bind:value={formData.password}
      errors={errors?.password}
    />
    <button type="submit" class="btn btn-primary" disabled={loading}>
      {#if loading}
        <span class="loading loading-spinner loading-md"></span>
      {:else}
        {$t('profile.security.submit', { defaultValue: 'save' })}
      {/if}
    </button>
  </form>
</div>

<Toast type={$toast.type} message={$toast.message} show={$toast.show} />
