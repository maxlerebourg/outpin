<script lang="ts">
import { onDestroy } from 'svelte'
import { goto } from '$app/navigation'
import { page } from '$app/state'

import { Api } from '$lib/api'
import Icon from '$lib/components/Icon.svelte'
import MarkupEditor from '$lib/components/form/MarkupEditor.svelte'
import Rating from '$lib/components/form/Rating.svelte'
import Organization from '$lib/components/organization/Organization.svelte'
import { t } from '$lib/i18n'
import { adventuresStore } from '$lib/store'

let isEditable = $state<boolean>(false)
let adventure = $state<Adventure>()
const adventuresUnsubscribe = adventuresStore.subscribe(
  (v) => (adventure = v.find(({ id }) => page.params.id === id)),
)

async function loadMapMarker() {
  return await import('$lib/components/map/MapMarker.svelte')
}

onDestroy(adventuresUnsubscribe)
</script>

{#if adventure}
  <div class="flex items-baseline justify-between mb-6">
    <h1 class="text-4xl font-semibold">
      {adventure.name}
    </h1>
    {#if adventure.rating}
      <Rating
        id="adventure-rating-{adventure.id}"
        value={adventure.rating}
        disabled
        _class="rating-md"
      />
    {/if}
  </div>
  <div class="mb-4">
    {#if adventure.category}
      <span class="badge badge-primary">
        {adventure.category.display_name} {adventure.category.icon}
      </span>
    {/if}
    <button
      type="button"
      class="btn btn-ghost btn-xs"
      onclick={async () => {
        await Api.deleteAdventure({ id: page.params.id })
        goto('/adventures')
      }}
    >
      {$t('adventures.id.delete', { defaultValue: 'Delete' })}
    </button>
    <a
      class="btn btn-ghost btn-xs"
      href="/?{new URLSearchParams({ adventure_id: page.params.id }).toString()}"
    >
      {$t('adventures.id.modify', { defaultValue: 'Modify' })}
    </a>
    <button
      class="btn btn-ghost btn-xs"
      onclick={() => (isEditable = !isEditable)}
    >
      {$t('adventures.id.edit', { defaultValue: 'Edit' })}
    </button>
  </div>
  <MarkupEditor
    contentValue={adventure.description ?? undefined}
    {isEditable}
    onSave={async (description: string) => { await Api.patchAdventure({ id: page.params.id, description }) }}
  />
  <div class="flex flex-col gap-4 my-4">
    {#each adventure?.visits ?? [] as visit}
      <div class="card bg-base-100 p-4 flex flex-col sm:flex-row justify-between gap-4">
        <div class="w-full shrink">
          <div class="flex flex-wrap items-baseline gap-2 mb-4">
            <h2 class="text-xl mr-auto">{visit.location}</h2>
            {#if visit.rating}
              <Rating id="visit-rating-{visit.id}" value={visit.rating} disabled />
            {/if}
          </div>
          {#if visit.category}
            <span class="mb-4 inline-block badge badge-primary">
              {visit.category.display_name} {visit.category.icon}
            </span>
          {/if}
          <p class="flex items-center justify-between w-full mb-4 text-xs">
            <Icon icon="calendar" _class="h-4 w-4 inline mr-2 opacity-70" />
            <span class="flex-1 text-sm">
              {visit.day_duration ?? 0}
              {(visit.day_duration ?? 0) < 2
                ? $t('adventures.id.day', { defaultValue: 'day' })
                : $t('adventures.id.days', { defaultValue: 'days' })}
            </span>
            {#if visit.start_date || visit.end_date}
              <span>
                {visit.start_date
                  ? new Date(visit.start_date).toLocaleDateString(undefined, { timeZone: 'UTC' })
                  : ''}
                {visit.end_date && visit.end_date !== visit.start_date
                  ? `- ${new Date(visit.end_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}`
                  : ''}
              </span>
            {/if}
          </p>
          <MarkupEditor
            contentValue={visit.notes ?? undefined}
            {isEditable}
            onSave={async (notes: string) => { await Api.patchVisit({ id: visit.id, notes }) }}
          />
        </div>
        <div class="sm:min-w-xs flex flex-col">
          <div class="w-full inline-flex justify-between text-sm mb-2 mt-auto">
            <p>
              {$t('adventures.id.latitude', { defaultValue: 'Latitude' })}
              <br/>
              {visit.latitude?.toFixed(6)}° N
            </p>
            <p class="text-right">
              {$t('adventures.id.longitude', { defaultValue: 'Longitude' })}
              <br/>
              {visit.longitude?.toFixed(6)}° W
            </p>
          </div>
          <div class="w-full flex-1">
            {#await loadMapMarker() then mapMarker}
              <mapMarker.default marker={{ lat: visit.latitude ?? 0, lng: visit.longitude ?? 0 }} />
            {/await}
          </div>
        </div>
      </div>
    {/each}
  </div>

  <Organization {isEditable}/>
{/if}
