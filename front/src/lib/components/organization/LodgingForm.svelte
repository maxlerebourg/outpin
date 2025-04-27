<script lang="ts">
import { page } from '$app/state'
import { Api, FormError } from '$lib/api'
import { t } from '$lib/i18n'

let { lodging, onFinish } = $props<{
  lodging?: Lodging
  onFinish: () => void
}>()
let newLodging = $state<Lodging>(lodging || createLodging())
let errors = $state<Record<string, string> | null>(null)
let loading = $state<boolean>(false)

async function handleSubmit(evt: Event) {
  evt.preventDefault()
  loading = true
  try {
    if (newLodging.id) {
      await Api.patchLodging(newLodging)
    } else {
      await Api.postLodging({ ...newLodging, adventure_id: page.params.id })
    }
    onFinish()
  } catch (err) {
    if (err instanceof FormError) errors = err.errors as Record<string, string>
  }
  loading = false
}
function createLodging(): Lodging {
  return {
    id: '',
    adventure_id: '',
    location: '',
    company: '',
    reservation: '',
    cost: 0,
    from_at: null,
    to_at: null,
  }
}
</script>

<form class="card bg-base-300 p-4 mb-4 w-full gap-2 max-w-xl m-auto" onsubmit={handleSubmit}>
  <div class="flex items-center justify-between w-full">
    <h2>
      {newLodging.id
        ? $t('organization.lodging-form.title-modify', { defaultValue: 'Modify' })
        : $t('organization.lodging-form.title-create', { defaultValue: 'Create' })}
      {$t('organization.lodging-form.title', { defaultValue: 'lodging' })}
    </h2>
    <button type="button" class="btn btn-square btn-sm" onclick={onFinish}>✕</button>
  </div>
  <label class="input w-full">
    {$t('organization.lodging-form.input-location-label', { defaultValue: 'Location' })}:
    <input type="text" bind:value={newLodging.location} />
  </label>
  {#if errors?.location}<span class="text-xs text-error">{errors.location}</span>{/if}
  <label class="input w-full">
    {$t('organization.lodging-form.input-company-label', { defaultValue: 'Company' })}:
    <input type="text" bind:value={newLodging.company} />
  </label>
  {#if errors?.company}<span class="text-xs text-error">{errors.company}</span>{/if}
  <div class="flex gap-2 input w-full">
    <label class="flex-1 flex gap-2">
      {$t('organization.lodging-form.input-reservation-label', { defaultValue: 'Reservation' })}:
      <input type="text" class="" bind:value={newLodging.reservation} />
    </label>
    <label class="flex gap-2">
      {$t('organization.lodging-form.input-cost-label', { defaultValue: 'Cost' })}:
      <input type="number" step="0.01" min="0" class="w-16" bind:value={newLodging.cost} />
    </label>
  </div>
  {#if errors?.reservation}<span class="text-xs text-error">{errors.reservation}</span>{/if}
  {#if errors?.cost}<span class="text-xs text-error">{errors.cost}</span>{/if}
  <div class="flex flex-wrap gap-2">
    <label class="input flex-1">
      {$t('organization.lodging-form.input-from-at-label', { defaultValue: 'From' })}:
      <input type="datetime-local" bind:value={newLodging.from_at} />
    </label>
    <label class="input flex-1">
      {$t('organization.lodging-form.input-to-at-label', { defaultValue: 'To' })}:
      <input type="datetime-local" min={newLodging.from_at} bind:value={newLodging.to_at} />
    </label>
  </div>
  {#if errors?.from_at}<span class="text-xs text-error">{errors.from_at}</span>{/if}
  {#if errors?.to_at}<span class="text-xs text-error">{errors.to_at}</span>{/if}

  <button type="submit" class="btn btn-primary" disabled={loading}>
    {#if loading}
      <span class="loading loading-spinner loading-md"></span>
    {:else}
      {newLodging.id
        ? $t('organization.lodging-form.submit-modify', { defaultValue: 'Modify' })
        : $t('organization.lodging-form.submit-create', { defaultValue: 'Create' })}
    {/if}
  </button>
</form>