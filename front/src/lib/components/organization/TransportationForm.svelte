<script lang="ts">
import { page } from '$app/state'
import { Api, FormError } from '$lib/api'
import { t } from '$lib/i18n'

let { transportation, onFinish } = $props<{
  transportation?: Transportation
  onFinish: () => void
}>()
let newTransportation = $state<Transportation>(
  transportation || createTransportation(),
)
let errors = $state<Record<string, string> | null>(null)
let loading = $state<boolean>(false)

async function handleSubmit(evt: Event) {
  evt.preventDefault()
  loading = true
  try {
    if (newTransportation.id) {
      await Api.patchTransportation(newTransportation)
    } else {
      await Api.postTransportation({
        ...newTransportation,
        adventure_id: page.params.id,
      })
    }
    onFinish()
  } catch (err) {
    if (err instanceof FormError) errors = err.errors as Record<string, string>
  }
  loading = false
}
function createTransportation(): Transportation {
  return {
    id: '',
    adventure_id: '',
    company: null,
    type: 'car',
    reservation: null,
    cost: 0,
    from: null,
    from_at: null,
    to: null,
    to_at: null,
  }
}
</script>

<form class="card bg-base-300 p-4 mb-4 w-full gap-2 max-w-xl m-auto" onsubmit={handleSubmit}>
  <div class="flex items-center justify-between w-full">
    <h2>
      {newTransportation.id
        ? $t('organization.transportation-form.title-modify', { defaultValue: 'Modify' })
        : $t('organization.transportation-form.title-create', { defaultValue: 'Create' })}
      {$t('organization.transportation-form.title', { defaultValue: 'transportation' })}
    </h2>
    <button type="button" class="btn btn-square btn-sm" onclick={onFinish}>✕</button>
  </div>
  <label class="input w-full">
    {$t('organization.transportation-form.input-type-label', { defaultValue: 'Type' })}:
    <select class="grow" bind:value={newTransportation.type}>
      <option value="car">
        {$t('organization.transportation-form.input-type-car-option', { defaultValue: 'Car' })}
      </option>
      <option value="boat">
        {$t('organization.transportation-form.input-type-boat-option', { defaultValue: 'Boat' })}
      </option>
      <option value="bike">
        {$t('organization.transportation-form.input-type-bike-option', { defaultValue: 'Bike' })}
      </option>
      <option value="bus">
        {$t('organization.transportation-form.input-type-bus-option', { defaultValue: 'Bus' })}
      </option>
      <option value="flight">
        {$t('organization.transportation-form.input-type-flight-option', { defaultValue: 'Flight' })}
      </option>
      <option value="train">
        {$t('organization.transportation-form.input-type-train-option', { defaultValue: 'Train' })}
      </option>
    </select>
  </label>
  <label class="input w-full">
    {$t('organization.transportation-form.input-company-label', { defaultValue: 'Company' })}:
    <input type="text" bind:value={newTransportation.company} />
  </label>
  <div class="input flex gap-2 w-full">
    <label class="flex-1 flex gap-2">
      {$t('organization.transportation-form.input-reservation-label', { defaultValue: 'Reservation' })}:
      <input type="text" bind:value={newTransportation.reservation} />
    </label>
    <label class="flex gap-2">
      {$t('organization.transportation-form.input-cost-label', { defaultValue: 'Cost' })}:
      <input type="number" step="0.01" min="0" class="w-16" bind:value={newTransportation.cost} />
    </label>
  </div>
  {#if errors?.company}<span class="text-xs text-error">{errors.company}</span>{/if}
  {#if errors?.cost}<span class="text-xs text-error">{errors.cost}</span>{/if}
  <div class="flex gap-2 input w-full">
    <label class="flex-1 flex gap-2">
      {$t('organization.transportation-form.input-from-label', { defaultValue: 'From' })}:
      <input
        type="text"
        placeholder={$t('organization.transportation-form.input-to-placeholder', { defaultValue: 'City' })}
        bind:value={newTransportation.from}
      />
    </label>
    <label>
      <input type="datetime-local" max={newTransportation.to_at} bind:value={newTransportation.from_at} />
    </label>
  </div>
  {#if errors?.from}<span class="text-xs text-error">{errors.from}</span>{/if}
  {#if errors?.from_at}<span class="text-xs text-error">{errors.from_at}</span>{/if}
  <div class="flex gap-2 input w-full">
    <label class="flex-1 flex gap-2">
      {$t('organization.transportation-form.input-to-label', { defaultValue: 'To' })}:
      <input
        type="text"
        placeholder={$t('organization.transportation-form.input-to-placeholder', { defaultValue: 'City' })}
        bind:value={newTransportation.to}
      />
    </label>
    <label>
      <input type="datetime-local" min={newTransportation.from_at} bind:value={newTransportation.to_at} />
    </label>
  </div>
  {#if errors?.to}<span class="text-xs text-error">{errors.to}</span>{/if}
  {#if errors?.to_at}<span class="text-xs text-error">{errors.to_at}</span>{/if}

  <button type="submit" class="btn btn-primary" disabled={loading}>
    {#if loading}
      <span class="loading loading-spinner loading-md"></span>
    {:else}
      {newTransportation.id
        ? $t('organization.transportation-form.submit-modify', { defaultValue: 'Modify' })
        : $t('organization.transportation-form.submit-create', { defaultValue: 'Create' })}
    {/if}
  </button>
</form>
