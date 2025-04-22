<script lang="ts">
import { page } from '$app/state'
import { Api, FormError } from '$lib/api'
import { t } from '$lib/i18n'

let { activity, onFinish } = $props<{ activity?: Activity, onFinish: () => void }>()
let newActivity = $state<Activity>(activity ?? createActivity())
let errors = $state<Record<string, string> | null>(null)
let loading = $state<boolean>(false)

async function handleSubmit(evt: Event) {
  console.log('yo')
  evt.preventDefault()
  loading = true
  try {
    if (newActivity.id) {
      await Api.patchActivity(newActivity)
    } else {
      await Api.postActivity({ ...newActivity,  adventure_id: page.params.id,})
    }
    onFinish()
  } catch (err) {
    if (err instanceof FormError) errors = err.errors as Record<string, string>
  }
  loading = false
}
function createActivity(): Activity {
  return {
    id: '',
    adventure_id: '',
    name: '',
    location: '',
    cost: 0,
    at: null,
  }
}
</script>

<form class="card bg-base-300 p-4 mb-4 w-full gap-2 max-w-xl m-auto" onsubmit={handleSubmit}>
  <h2>
    {newActivity.id
      ? $t('organization.activity-form.title-modify', { defaultValue: 'Modify' })
      : $t('organization.activity-form.title-create', { defaultValue: 'Create' })}
    {$t('organization.activity-form.title', { defaultValue: 'activity' })}
  </h2>
  <label class="input w-full">
    {$t('organization.activity-form.input-location-label', { defaultValue: 'Location' })}:
    <input type="text" bind:value={newActivity.location} />
  </label>
  <div class="input flex gap-2 w-full">
    <label class="flex-1 flex gap-2">
      {$t('organization.activity-form.input-name-label', { defaultValue: 'Name' })}:
      <input type="text" bind:value={newActivity.name} />
    </label>
    <label class="flex gap-2">
      {$t('organization.activity-form.input-cost-label', { defaultValue: 'Cost' })}:
      <input type="number" class="w-16" bind:value={newActivity.cost} />
    </label>
  </div>
  <label class="input w-full">
    {$t('organization.activity-form.input-at-label', { defaultValue: 'Date' })}:
    <input type="datetime-local" bind:value={newActivity.at} />
  </label>

  <button type="submit" class="btn btn-primary" disabled={loading}>
    {#if loading}
      <span class="loading loading-spinner loading-md"></span>
    {:else}
      {newActivity.id
        ? $t('organization.activity-form.submit-modify', { defaultValue: 'Modify' })
        : $t('organization.activity-form.submit-create', { defaultValue: 'Create' })}
    {/if}
  </button>
</form>