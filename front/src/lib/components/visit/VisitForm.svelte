<script lang="ts">
import { Api, FormError } from '$lib/api'
import { t } from '$lib/i18n'
import CategoryPicker from '../form/CategoryPicker.svelte'
import Rating from '../form/Rating.svelte'
import Icon from '../Icon.svelte'

let {
  newAdventure = $bindable(),
  visit = $bindable(),
  onSearch,
} = $props<{
  newAdventure: Adventure
  visit: Visit | null
  onSearch: (s: string) => Promise<void>
}>()

let loading = $state<boolean>(false)
let errors = $state<Record<string, string> | null>()

async function upsertVisit(evt: Event) {
  evt.preventDefault()
  loading = true
  try {
    if (visit.id) {
      const modifiedVisit = await Api.patchVisit({
        ...visit,
        notes: visit.notes || null,
      })
      newAdventure.visits.splice(
        newAdventure.visits.findIndex(({ id }: Visit) => id === visit.id),
        1,
        modifiedVisit,
      )
    } else {
      const visitsLength = newAdventure.visits.length
      const newVisit = await Api.postVisit({
        ...visit,
        day_duration: Number(visit.day_duration),
        notes: visit.notes || null,
        order: newAdventure.visits.length,
        adventure_id: newAdventure.id,
      })
      if (visitsLength !== 0) newAdventure.visits.push(newVisit)
    }
    errors = null
    visit = null
  } catch (err) {
    if (err instanceof FormError) errors = err.errors as Record<string, string>
  }
  loading = false
}

function onAdd(value: number) {
  const duration = Number(visit.day_duration ?? 0) + value
  if (duration < 0) return
  visit.day_duration = duration
}
</script>

<form class="flex flex-col gap-2" onsubmit={upsertVisit}>
  <div class="flex flex-wrap justify-between">
    <h3>
      {visit.id
        ? $t('visit-form.title-modify', { defaultValue: 'Modify' })
        : $t('visit-form.title-create', { defaultValue: 'Add' })}
      {$t('visit-form.title', { defaultValue: 'a step' })}
    </h3>
    <Rating id="visit-rating-{visit.id}" bind:value={visit.rating} />
  </div>
  <label for="location" class="input w-full flex items-center gap-2">
    <Icon icon="location" _class="min-w-4 h-4 opacity-70" />
    {$t('visit-form.input-location-label', { defaultValue: 'Step at' })}:
    <input
      id="location"
      class="w-full"
      type="text"
      placeholder={$t('visit-form.input-location-placeholder', { defaultValue: 'Click on the map' })}
      bind:value={visit.location}
    />
    <button type="button" class="btn btn-xs btn-square" onclick={() => onSearch(visit.location)}>
      <Icon icon="search" _class="min-w-4 h-4 opacity-70" />
    </button>
  </label>
  {#if errors?.location}<span class="text-xs text-error">{errors.location}</span>{/if}
  <CategoryPicker id="visit-category" bind:value={visit.category_id} />
  <label for="day_duration" class="input  w-full px-1">
    <button
      type="button"
      class="btn btn-square btn-sm text-xl!"
      onclick={() => onAdd(-1)}
    >
      <Icon icon="minus" _class="w-4 h-4 opacity-70" />
    </button>
    <input
      id="day_duration"
      type="text"
      class="flex-1 text-end"
      bind:value={visit.day_duration}
      min="0"
    />
    <span class="flex-1">{$t('visit-form.input-day-duration-label', { defaultValue: 'Nights' })}</span>
    <button
      type="button"
      class="btn btn-square btn-sm text-xl!"
      onclick={() => onAdd(1)}
    >
      <Icon icon="plus" _class="w-4 h-4 opacity-70" />
    </button>
  </label>
  {#if errors?.day_duration}<span class="text-xs text-error">{errors.day_duration}</span>{/if}
  <textarea
    class="textarea textarea-bordered w-full h-auto"
    placeholder={$t('visit-form.input-notes-placeholder', { defaultValue: 'Add notes' })}
    bind:value={visit.notes}
  ></textarea>
  {#if errors?.notes}<span class="text-xs text-error">{errors.notes}</span>{/if}
  <div class="flex justify-end gap-2">
    <button
      type="button"
      disabled={loading}
      onclick={() => (visit = null)}
      class="btn btn-ghost"
    >
      {#if loading}
        <span class="loading loading-spinner loading-md"></span>
      {:else}
        {$t('visit-form.submit-close', { defaultValue: 'Close' })}
      {/if}
    </button>
    <button type="submit" disabled={loading} class="btn btn-secondary">
      {#if loading}
        <span class="loading loading-spinner loading-md"></span>
      {:else}
        {visit.id
          ? $t('visit-form.submit-modify', { defaultValue: 'Modify' })
          : $t('visit-form.submit-create', { defaultValue: 'Create' })}
      {/if}
    </button>
  </div>
</form>
