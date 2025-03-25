<script lang="ts">
import { Api, FormError } from '$lib/api'
import AdventureForm from '$lib/components/AdventureForm.svelte'
import Icon from '$lib/components/Icon.svelte'
import { t } from '$lib/i18n'

let searchHistoryRaw = $state<string>('')
let visits = $state<Record<string, Visit>>({})
let errors = $state<Record<string, string> | null>()
let loading = $state<string | null>()
let newAdventure = $state<Adventure & { visitIds: string[] }>(createAdventure())

function createAdventure(): Adventure & { visitIds: string[] } {
  return {
    id: '',
    category_id: null,
    user_id: null,
    rating: 0,
    start_date: null,
    end_date: null,
    day_duration: 0,
    name: '',
    description: null,
    category: null,
    visits: [],
    visitIds: [],
  }
}

function findMatchingBookings() {
  let searchHistory: Array<{
    servicedata: Array<{
      searchlocationlatitude: number
      searchlocationlongitude: number
      rawlocation: string
      checkindate: string
      checkoutdate: string
    }>
  }>
  try {
    searchHistory = JSON.parse(searchHistoryRaw)
  } catch (err: any) {
    errors = { error: err.message }
    return
  }
  errors = null
  const results: Visit[] = []
  const duplicates = new Set()

  searchHistory.forEach(({ servicedata }) => {
    servicedata.forEach((searchData) => {
      if (searchData.checkindate && searchData.checkoutdate) {
        const key = `${searchData.rawlocation}_${searchData.checkindate}_${searchData.checkoutdate}`
        if (duplicates.has(key)) return
        duplicates.add(key)
        results.push({
          latitude: searchData.searchlocationlatitude,
          longitude: searchData.searchlocationlongitude,
          location: searchData.rawlocation,
          start_date: searchData.checkindate,
          end_date: searchData.checkoutdate,
          day_duration: Math.round(
            (new Date(searchData.checkoutdate).valueOf() -
              new Date(searchData.checkindate).valueOf()) /
              86400000,
          ),
          notes: null,
          id: '',
          adventure_id: '',
          category_id: null,
          rating: 0,
          order: 0,
        })
      }
    })
  })
  visits = results
    .sort((a, b) =>
      b.start_date && a.start_date && b.start_date < a.start_date ? 1 : -1,
    )
    .reduce<Record<string, Visit>>(
      (acc, visit) => ({
        ...acc,
        [`${visit.location}_${visit.start_date}_${visit.end_date}`]: visit,
      }),
      {},
    )
}
async function onSubmitAdventure(evt: Event) {
  evt.preventDefault()
  loading = 'adventure'
  try {
    const adventure = await Api.postAdventure({
      ...newAdventure,
      start_date: visits[newAdventure.visitIds[0]]?.start_date,
    })
    const adventureId = adventure.id
    for (let i = 0; i < newAdventure.visitIds.length; i++) {
      await Api.postVisit({
        ...visits[newAdventure.visitIds[i]],
        adventure_id: adventureId,
        order: i,
      })
      delete visits[newAdventure.visitIds[i]]
    }
    newAdventure = createAdventure()
  } catch (err) {
    if (err instanceof FormError) errors = err.errors as Record<string, string>
  }
  loading = null
}
$effect(() => console.log(newAdventure.visitIds))
</script>

<h1 class="text-4xl mb-4">
  {$t('adventures.aibnb-import.title', { defaultValue: 'Airbnb import' })}
</h1>
{#if Object.keys(visits).length === 0}
  <label for="json" class="block mb-2">
    {$t('adventures.aibnb-import.input-json-label', { defaultValue: 'Search history from Airbnb (JSON: json/search_history.json)' })}
  </label>
  <textarea
    id="json"
    class="textarea textarea-bordered w-full min-h-80 mb-2"
    bind:value={searchHistoryRaw}
  ></textarea>
  {#if errors?.error}<span class="text-xs text-error">{errors.error}</span>{/if}
  <div class="alert border border-primary mt-4 mb-4 text-sm flex">
    <div class="text-left">
      {$t('adventures.aibnb-import.data-disclaimer', { defaultValue: 'No data will be sent to any server, the compute will happen in this browser.' })}
    </div>
  </div>
  <button type="button" class="btn btn-primary" onclick={findMatchingBookings}>
    {$t('adventures.aibnb-import.submit', { defaultValue: 'Compute' })}
  </button>
{:else}
  <div class="mt-4 flex flex-col-reverse md:flex-row gap-4">
    <div class="w-xs">
      <form class="flex flex-col gap-2" onsubmit={onSubmitAdventure}>
        <h2>{$t('adventures.aibnb-import.subtitle', { defaultValue: 'Add an adventure' })}</h2>
        {#if errors?.error}<span class="text-xs text-error">{errors.error}</span>{/if}
        <label for="name" class="input w-full flex items-center gap-2">
          <Icon icon="flag" _class="min-w-4 h-4 opacity-70" />
          <input
            id="name"
            type="text"
            class="grow"
            placeholder={$t('adventures.aibnb-import.input-name-placeholder', { defaultValue: 'Name' })}
            bind:value={newAdventure.name}
          />
        </label>
        {#if errors?.name}<span class="text-xs text-error">{errors.name}</span>{/if}
        {#if newAdventure.visitIds.length > 0}
          <ul class="timeline timeline-vertical timeline-snap-icon timeline-compact mb-2">
            {#each newAdventure?.visitIds ?? [] as visitId, i}
              <li  id="visit-{i.toString()}" class="w-full rounded">
                {#if i !== 0}<hr />{/if}
                <div class="timeline-middle">
                  <span class="status status-primary"></span>
                </div>
                <div class="timeline-end m-0 pl-2 py-2 w-full">
                  <div class="flex justify-between gap-2">
                    <div class="flex-1">
                      {#if visits[visitId].start_date || visits[visitId].end_date}
                        <time class="text-xs h-6">
                          {visits[visitId].start_date
                            ? new Date(visits[visitId].start_date).toLocaleDateString(undefined, { timeZone: 'UTC' })
                            : ""}
                          {visits[visitId].end_date && visits[visitId].end_date !== visits[visitId].start_date
                            ? `- ${new Date(visits[visitId].end_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}`
                            : ""}
                        </time>
                      {/if}
                      <p>{visits[visitId].location}</p>
                    </div>
                  </div>
                </div>
                {#if i !== newAdventure.visitIds.length - 1}<hr />{/if}
              </li>
            {/each}
          </ul>
        {/if}
        <div class="card-actions justify-end gap-2">
          <button class="btn btn-primary" disabled={!!loading || newAdventure.visitIds.length === 0}>
            {#if loading === 'adventure'}
              <span class="loading loading-spinner loading-md"></span>
            {:else}
              Next
            {/if}
          </button>
        </div>
      </form>
    </div>
    <div class="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
      {#each Object.entries(visits) as [key, visit]}
        <label class="flex items-center gap-2">
          <input type="checkbox" class="checkbox" bind:group={newAdventure.visitIds} value={key} />
          <div class="w-full">
            {#if visit.start_date || visit.end_date}
              <time class="text-xs h-6">
                {visit.start_date
                  ? new Date(visit.start_date).toLocaleDateString(undefined, { timeZone: 'UTC' })
                  : ""}
                {visit.end_date && visit.end_date !== visit.start_date
                  ? `- ${new Date(visit.end_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}`
                  : ""}
              </time>
            {/if}
            <p>{visit.location}</p>
          </div>
        </label>
      {/each}
    </div>
  </div>
{/if}
