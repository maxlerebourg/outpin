<script lang="ts">
import { onDestroy } from 'svelte'
import { adventuresStore, currentUserStore } from '$lib/store'

import { goto, replaceState } from '$app/navigation'
import { page } from '$app/state'

import { Api, FormError } from '$lib/api'
import { t } from '$lib/i18n'

import VisitsDragger from './visit/VisitsDragger.svelte'
import CategoryPicker from './form/CategoryPicker.svelte'
import Rating from './form/Rating.svelte'
import Icon from './Icon.svelte'

let { address, onClose, onSearch } = $props<{
  address: Address | null
  onClose: () => void
  onSearch: (s: string) => Promise<void>
}>()

let loading = $state<boolean>(false)
let user = $state<User | null>(null)
let errors = $state<Record<string, string> | null>()
let adventures = $state<Adventure[]>([])
let newAdventure = $state<Adventure>(createAdventure())

function createAdventure(): Adventure {
  return {
    id: '',
    category_id: null,
    user_id: null,
    day_duration: null,
    start_date: null,
    end_date: null,
    rating: 0,
    name: '',
    description: null,
    visits: [],
  }
}

function onFinish() {
  newAdventure = createAdventure()
  const searchParams = page.url.searchParams
  searchParams.delete('adventure_id')
  replaceState(`/?${searchParams.toString()}`, {})
  onClose()
  errors = null
  loading = false
}
async function onSubmitAdventure(evt: Event) {
  evt.preventDefault()
  loading = true
  if (!user) goto('/auth/login')
  try {
    const searchParams = page.url.searchParams
    const adventureId = searchParams.get('adventure_id')
    let adventure: Adventure
    if (adventureId && adventures.find(({ id }) => id === adventureId)) {
      adventure = await Api.patchAdventure({ ...newAdventure, id: adventureId })
    } else {
      adventure = await Api.postAdventure(newAdventure)
      searchParams.set('adventure_id', adventure.id)
      replaceState(`/?${searchParams.toString()}`, {})
    }
    newAdventure = { ...newAdventure, ...adventure }
  } catch (err) {
    if (err instanceof FormError) errors = err.errors as Record<string, string>
  }
  loading = false
}

$effect(() => {
  if (!address) return
  if (!newAdventure.id) newAdventure.name = address?.country ?? ''
  errors = null
})

let loaded = 0
function onLoad() {
  loaded += 1
  if (loaded < 2) return
  const adventureId = page.url.searchParams.get('adventure_id')
  if (user && adventureId) {
    const adventure = adventures.find(({ id }) => adventureId === id)
    if (!adventure) return
    newAdventure = {
      ...adventure,
      visits:
        (newAdventure?.visits?.length ?? 0) > 0
          ? newAdventure?.visits
          : (adventure.visits ?? []),
    }
  }
}

const currentUserUnsubscribe = currentUserStore.subscribe((v: User | null) => {
  user = v
  onLoad()
})
const adventuresUnsubscribe = adventuresStore.subscribe((v: Adventure[]) => {
  adventures = v
  onLoad()
})
onDestroy(() => {
  currentUserUnsubscribe()
  adventuresUnsubscribe()
})
</script>

<div class="w-full">
  <div class="mb-4 flex flex-wrap justify-between items-center">
    <h2 class="text-2xl">{$t('adventure-form.title', { defaultValue: 'Adventure' })}</h2>
    <Rating id="adventure-rating" bind:value={newAdventure.rating} />
  </div>
  {#if errors?.error}<span class="text-error">{errors.error}</span>{/if}
  <form class="flex flex-col gap-2 mb-4" onsubmit={onSubmitAdventure}>
    <label for="name" class="input w-full flex items-center gap-2">
      <Icon icon="flag" _class="min-w-4 h-4 opacity-70" />
      {$t('adventure-form.input-name-label', { defaultValue: 'My trip in' })}:
      <input
        id="name"
        type="text"
        class="grow"
        placeholder={$t('adventure-form.input-name-placeholder', { defaultValue: 'Name' })}
        bind:value={newAdventure.name}
      />
    </label>
    {#if errors?.name}<span class="text-xs text-error">{errors.name}</span>{/if}
    <label class="input w-full">
      <Icon icon="calendar" _class="min-w-4 h-4 opacity-70" />
      {$t('adventure-form.input-start-date-label', { defaultValue: 'Start at' })}:
      <input
        type="date"
        class="w-full"
        bind:value={newAdventure.start_date}
      />
    </label>
    <CategoryPicker id="adventure-category" bind:value={newAdventure.category_id} />
    <textarea
      class="textarea textarea-bordered w-full h-auto"
      placeholder={$t('adventure-form.input-description-placeholder', { defaultValue: 'Add description' })}
      bind:value={newAdventure.description}
    ></textarea>
    <div class="card-actions justify-end gap-2">
      <button type="submit" class="btn btn-primary" disabled={loading}>
        {#if loading}
          <span class="loading loading-spinner loading-md"></span>
        {:else}
          {newAdventure.id
            ? $t('adventure-form.submit-modify', { defaultValue: 'Modify' })
            : $t('adventure-form.submit-create', { defaultValue: 'Create' })}
        {/if}
      </button>
    </div>
  </form>
  {#if newAdventure.id}
    <VisitsDragger
      {address}
      {onSearch}
      bind:newAdventure={newAdventure}
      bind:loading={loading}
    />
    <div class="mt-8 w-full flex justify-end gap-2">
      <button
        type="button"
        class="btn btn-primary"
        disabled={loading || newAdventure.visits?.length === 0}
        onclick={() => onFinish()}
      >
        {$t('adventure-form.finish', { defaultValue: 'Finish' })}
      </button>
    </div>
  {/if}
</div>
