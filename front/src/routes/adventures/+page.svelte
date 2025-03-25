<script lang="ts">
import { onDestroy } from 'svelte'
import { Api } from '$lib/api'
import CategoryPicker from '$lib/components/form/CategoryPicker.svelte'
import Icon from '$lib/components/Icon.svelte'
import Rating from '$lib/components/form/Rating.svelte'
import { t } from '$lib/i18n'
import { adventuresStore } from '$lib/store'

type Order = 'RATE_DESC' | 'RATE_ASC' | 'DATE_DESC' | 'DATE_ASC'
type Visited = 'ALL' | 'VISITED' | 'PLANED'

let adventures = $state<Adventure[]>([])
let filters = $state<{
  category_id: string | null
  is_visited: Visited
}>({ category_id: null, is_visited: 'ALL' })
let order = $state<Order>('DATE_DESC')
const now = new Date().toISOString()

const adventuresUnsubscribe = adventuresStore.subscribe((v) => (adventures = v))

onDestroy(adventuresUnsubscribe)
</script>

<h1 class="text-4xl font-semibold mb-6">{$t('adventures.title', { defaultValue: 'My adventures' })}</h1>
<div class="flex flex-wrap items-center mb-4 gap-2">
  <div class="min-w-24">
    <label class="select">
      <Icon icon="sort" _class="min-w-4 h-4 opacity-70" />
      <select bind:value={order}>
        <option value="DATE_DESC">
          {$t('adventures.input-order-label-1', { defaultValue: 'Newest first' })}
        </option>
        <option value="DATE_ASC">
          {$t('adventures.input-order-label-2', { defaultValue: 'Oldest first' })}
        </option>
        <option value="RATE_DESC">
          {$t('adventures.input-order-label-3', { defaultValue: 'Best rate first' })}
        </option>
        <option value="RATE_ASC">
          {$t('adventures.input-order-label-4', { defaultValue: 'Lowest rate first' })}
        </option>
      </select>
    </label>
  </div>
  <div class="min-w-24">
    <label class="select">
      <Icon icon="filter" _class="min-w-4 h-4 opacity-70" />
      <select bind:value={filters.is_visited}>
        <option value="ALL">
          {$t('adventures.input-is-visited-label-1', { defaultValue: 'All' })}
        </option>
        <option value="VISITED">
          {$t('adventures.input-is-visited-label-2', { defaultValue: 'Visited' })}
        </option>
        <option value="PLANED">
          {$t('adventures.input-is-visited-label-3', { defaultValue: 'Planed' })}
        </option>
      </select>
    </label>
  </div>
  <div class="min-w-24">
    <CategoryPicker noCreate id="filters-caterory" bind:value={filters.category_id} />
  </div>
</div>
{#if adventures.length > 0}
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {#each adventures
      .filter((a) => 
        (!filters.category_id || filters.category_id === a.category_id) && (
          (filters.is_visited === 'ALL') 
          || (filters.is_visited === 'VISITED' && (!a.start_date || a.start_date < now))
          || (filters.is_visited === 'PLANED' && (a.start_date && a.start_date > now))
        )
      )
      .sort((a, b) => {
        switch(order) {
          case 'DATE_DESC':
            return (a.start_date || '1900') < (b.start_date || '1900') ? 1 : -1
          case 'DATE_ASC':
            return (a.start_date || '2999') > (b.start_date || '2999') ? 1 : -1
          case 'RATE_DESC':
            return (b.rating || 0) - (a.rating || 0)
          case 'RATE_ASC':
            return (a.rating || 6) - (b.rating || 6)
        }
      }) as adventure(adventure.id)}
      <div id={adventure.id} class="card p-5 flex flex-col gap-2 w-full h-auto bg-base-100">
        <div class="flex items-center justify-between">
          <a
            href="/adventures/{adventure.id}"
            class="text-2xl font-semibold break-words text-wrap hover:underline -mb-2"
          >
            {adventure.name}
          </a>
          {#if adventure.rating}
            <Rating id="adventure-rating-{adventure.id}" value={adventure.rating} disabled />
          {/if}
        </div>
        <div>
          {#if adventure.category}
            <div class="badge badge-primary">
              {adventure.category.display_name} {adventure.category.icon}
            </div>
          {/if}
          <button
            type="button"
            class="btn btn-ghost btn-xs"
            onclick={async () => await Api.deleteAdventure({ id: adventure.id })}
          >
            {$t('adventures.delete', { defaultValue: 'delete' })}
          </button>
          <a
            class="btn btn-ghost btn-xs"
            href="/?{new URLSearchParams({ adventure_id: adventure.id }).toString()}"
          >
            {$t('adventures.modify', { defaultValue: 'modify' })}
          </a>
        </div>
          <p class="inline-flex items-center text-xs mb-1">
            <Icon icon="calendar" _class="h-3 w-3 inline mr-2 opacity-70" />
            <span class="flex-1 text-sm">
                {adventure.day_duration ?? 0}
                {(adventure.day_duration ?? 0) < 2
                  ? $t('adventures.day', { defaultValue: 'day' })
                  : $t('adventures.days', { defaultValue: 'days' })}
            </span>
            {#if adventure.start_date}
              <span>
                {adventure.start_date
                  ? new Date(adventure.start_date).toLocaleDateString(undefined, {
                      timeZone: 'UTC',
                    })
                  : ''}
                {adventure.end_date && adventure.end_date !== adventure.start_date
                  ? `- ${new Date(adventure.end_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}`
                  : ''}
              </span>
            {/if}
          </p>
        <div class="flex flex-col gap-2">
          {#each adventure.visits ?? [] as visit}
            <p class="text-xs leading-none">• {visit.location} {visit.category?.icon}</p>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{:else}
  <p>
    {$t('adventures.no-adventure-1', { defaultValue: 'You have not adventure, create one' })}
    <a class="underline" href="/">{$t('adventures.no-adventure-2', { defaultValue: 'here' })}</a>
  </p>
{/if}
<a href="/adventures/airbnb-import" class="btn btn-ghost btn-xs mt-4">
  {$t('adventures.airbnb-import', { defaultValue: 'Import from Airbnb (RGPD export)' })}
  <Icon icon="airbnb" _class="h-5 w-5 text-[#ff5f64]" />
</a>