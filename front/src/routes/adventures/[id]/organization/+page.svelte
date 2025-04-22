<script lang="ts">
import { onDestroy, onMount } from 'svelte'
import { goto } from '$app/navigation'
import { page } from '$app/state'

import { Api } from '$lib/api'
import Rating from '$lib/components/form/Rating.svelte'
import { t } from '$lib/i18n'
import { adventuresStore } from '$lib/store'
import ActivityForm from '$lib/components/organization/ActivityForm.svelte';
    import TransportationForm from '$lib/components/organization/TransportationForm.svelte';
    import LodgingForm from '$lib/components/organization/LodgingForm.svelte';

let adventure = $state<Adventure>()
const adventuresUnsubscribe = adventuresStore.subscribe(
  (v) => (adventure = v.find(({ id }) => page.params.id === id)),
)
$effect(() => console.log(adventure))

onMount(() => {
  Api.reloadActivities()
  Api.reloadLodgings()
  Api.reloadTransportations()
})
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
      {$t('adventures.id.organization.delete', { defaultValue: 'Delete' })}
    </button>
    <a
      class="btn btn-ghost btn-xs"
      href="/?{new URLSearchParams({ adventure_id: page.params.id }).toString()}"
    >
      {$t('adventures.id.organization.modify', { defaultValue: 'Modify' })}
    </a>
    <a
      class="btn btn-ghost btn-xs"
      href="/adventures/{adventure.id}/"
    >
      {$t('adventures.id.organization.visits', { defaultValue: 'Visits' })}
    </a>
  </div>

  <ActivityForm onFinish={() => {}} />
  <TransportationForm onFinish={() => {}} />
  <LodgingForm onFinish={() => {}} />
  
  <div class="collapse collapse-arrow bg-base-100 border-base-300 border">
    <input type="checkbox" />
    <div class="collapse-title font-semibold">
      {$t('adventures.id.organization.activities', { defaultValue: 'Activities' })}
    </div>
    <div class="collapse-content text-sm">
      <div class="flex flex-col gap-2">
        {#each adventure.activities ?? [] as activity}
          <p>
            {#if activity.at}
              <time>{new Date(activity.at).toLocaleString() }</time>
            {/if}
            <b>{activity.name}</b>
            {activity.location}
          </p>
        {/each}
      </div>
    </div>
  </div>
  <div class="collapse collapse-arrow bg-base-100 border-base-300 border">
    <input type="checkbox" />
    <div class="collapse-title font-semibold">
      {$t('adventures.id.organization.transportations', { defaultValue: 'Transportations' })}
    </div>
    <div class="collapse-content text-sm">
      <div class="flex flex-col gap-2">
        {#each adventure.transportations ?? [] as transportation}
          <p>
            {#if transportation.from_at}
              <time>{new Date(transportation.from_at).toLocaleString() }</time>
            {/if}
            {#if transportation.to_at}
              -
              <time>{new Date(transportation.to_at).toLocaleString() }</time>
            {/if}
            {#if transportation.company}
              <b>{transportation.company}</b>
            {/if}
            {transportation.type}
          </p>
        {/each}
      </div>
    </div>
  </div>
  <div class="collapse collapse-arrow bg-base-100 border-base-300 border">
    <input type="checkbox" />
    <div class="collapse-title font-semibold">
      {$t('adventures.id.organization.lodgings', { defaultValue: 'Lodgings' })}
    </div>
    <div class="collapse-content text-sm">
      <div class="flex flex-col gap-2">
        {#each adventure.lodgings ?? [] as lodging}
        <p>
          {#if lodging.from_at}
            <time>{new Date(lodging.from_at).toLocaleString() }</time>
          {/if}
          {#if lodging.to_at}
            -
            <time>{new Date(lodging.to_at).toLocaleString() }</time>
          {/if}
          <b>{lodging.location}</b>
          {#if lodging.company}
            {lodging.company}
          {/if}
          {#if lodging.reservation}
            <small>{lodging.reservation}</small>
          {/if}
          
        </p>
        {/each}
      </div>
    </div>
  </div>
{/if}
  