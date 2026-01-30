<script lang="ts">
import { onMount } from 'svelte'
import { Api } from '$lib/api'
import { t } from '$lib/i18n'
import Icon from '../Icon.svelte'
import VisitForm from './VisitForm.svelte'

let {
  address,
  newAdventure = $bindable(),
  loading = $bindable(),
  onSearch,
} = $props<{
  address: Address | null
  newAdventure: Adventure | null
  loading: boolean
  onSearch: (s: string) => Promise<void>
}>()
let dragStartIndex = $state<number>(0)
let dragOverIndex = $state<number>(0)
let modifiedVisit = $state<Visit | null>()

async function deleteVisit(removeId: string) {
  loading = true
  await Api.deleteVisit({ id: removeId })
  newAdventure.visits.splice(
    newAdventure.visits.findIndex(({ id }: Visit) => id === removeId),
    1,
  )
  loading = false
}

function createVisit(): Visit {
  return {
    id: '',
    adventure_id: '',
    day_duration: 0,
    start_date: null,
    end_date: null,
    notes: null,
    location: address
      ? `${address.city ? `${address.city}, ` : ''}${address.state}${address.postCode ? ` ${address.postCode}` : ''}, ${address.country}`
      : '',
    latitude: address?.latitude ?? 0,
    longitude: address?.longitude ?? 0,
    rating: 0,
    order: 0,
    category_id: null,
  }
}

function updateVisit(visit: Visit) {
  if (modifiedVisit?.id === visit.id) modifiedVisit = null
  else modifiedVisit = { ...visit }
}

function dragStart(index: number) {
  dragStartIndex = index
}

function dragOver(evt: Event, index: number) {
  evt.preventDefault()
  if (dragOverIndex === index) return
  document
    .getElementById(`visit-${dragOverIndex}`)
    ?.classList.remove('bg-primary/20')
  document.getElementById(`visit-${index}`)?.classList.add('bg-primary/20')
  dragOverIndex = index
}

async function dragDrop(index: number) {
  loading = true
  document
    .getElementById(`visit-${dragOverIndex}`)
    ?.classList.remove('bg-primary/20')
  const itemStart = newAdventure.visits[dragStartIndex]
  const itemEnd = newAdventure.visits[index]
  newAdventure.visits[dragStartIndex] = { ...itemEnd, order: dragStartIndex }
  newAdventure.visits[index] = { ...itemStart, order: index }
  await Api.patchVisit({
    id: newAdventure.visits[dragStartIndex].id,
    order: dragStartIndex,
  })
  if (dragStartIndex === index) {
    loading = false
    return
  }
  await Api.patchVisit({ id: newAdventure.visits[index].id, order: index })
  loading = false
}

$effect(() => {
  if (!address || !modifiedVisit) return
  modifiedVisit.location = `${address.city ? `${address.city}, ` : ''}${address.state}${address.postCode ? ` ${address.postCode}` : ''}, ${address.country}`
  modifiedVisit.latitude = address.latitude
  modifiedVisit.longitude = address.longitude
  address = null
})

onMount(() => {
  if (newAdventure?.visits.length === 0) modifiedVisit ??= createVisit()
})
</script>

<h2 class="mb-4 text-xl">{$t('visits-dragger.title', { defaultValue: 'Visits' })}</h2>
<ul class="timeline timeline-vertical timeline-snap-icon timeline-compact mb-2">
  {#each newAdventure.visits as visit, i (visit.id)}
    <li
      id="visit-{i.toString()}"
      draggable={true}
      ondragstart={() => dragStart(i)}
      ondrop={() => dragDrop(i)}
      ondragover={(evt: Event) => dragOver(evt, i)}
      style="transition: background 100ms"
      class="w-full rounded"
    >
      {#if i !== 0}<hr />{/if}
      <div class="timeline-middle">
        <Icon icon="drag" _class="w-3 h-3 opacity-70 cursor-move" />
      </div>
      <div class="timeline-end m-0 pl-2 py-2 w-full">
        <div class="flex justify-between gap-2">
          <div class="flex-1">
            <p class="flex items-center text-xs h-6">
              + {visit.day_duration ?? 0}
              {(visit.day_duration ?? 0) < 2
                ? $t('visits-dragger.night', { defaultValue: 'night' })
                : $t('visits-dragger.nights', { defaultValue: 'nights' })}
            </p>
            <p>{visit.location}</p>
          </div>
          <div class="flex gap-1">
            <button
              type="button"
              class="btn btn-square btn-xs"
              disabled={loading}
              onclick={() => updateVisit(visit)}
            >
              {#if loading}
                <span class="loading loading-spinner loading-xs"></span>
              {:else}
                <Icon icon="edit" _class="w-4 h-4" />
              {/if}
            </button>
            <button
              type="button"
              class="btn btn-square btn-xs"
              disabled={loading}
              onclick={() => deleteVisit(visit.id)}
            >
              {#if loading}
                <span class="loading loading-spinner loading-xs"></span>
              {:else}
                ✕
              {/if}
            </button>
          </div>
        </div>
        {#if modifiedVisit && modifiedVisit.id === visit.id}
          <div class="mt-2">
            <VisitForm bind:newAdventure={newAdventure} bind:visit={modifiedVisit} {onSearch} />
          </div>
        {/if}
      </div>
      <hr />
    </li>
  {/each}
  {#if !modifiedVisit || modifiedVisit.id === ''}
    <li>
      <hr />
      <div class="timeline-middle"><span class="block w-3 h-3"></span></div>
      <div class="timeline-end m-0 pl-2 pt-2 w-full">
        {#if modifiedVisit?.id === ''}
          <VisitForm bind:newAdventure={newAdventure} bind:visit={modifiedVisit} {onSearch} />
        {:else}
          <button
            type="button"
            disabled={loading}
            class="btn btn-secondary my-2"
            onclick={() => (modifiedVisit = createVisit())}
          >
            {$t('visits-dragger.submit-new', { defaultValue: 'New step' })}
          </button>
        {/if}
      </div>
    </li>
  {/if}
</ul>
