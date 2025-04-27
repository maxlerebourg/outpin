<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { page } from '$app/state'
  
  import { Api } from '$lib/api'
  import { t } from '$lib/i18n'
  import { adventuresStore } from '$lib/store'
  import ActivityForm from '$lib/components/organization/ActivityForm.svelte'
  import Icon from '$lib/components/Icon.svelte'
  import TransportationForm from '$lib/components/organization/TransportationForm.svelte'
  import LodgingForm from '$lib/components/organization/LodgingForm.svelte'
  import { formatDatetime } from '$lib/utils'
  
  let { isEditable = false } = $props<{ isEditable?: boolean }>()
  let adventure = $state<Adventure>()
  let newActivity = $state<Activity | null | undefined>(null)
  let newTransportation = $state<Transportation | null | undefined>(null)
  let newLodging = $state<Lodging | null | undefined>(null)
  const adventuresUnsubscribe = adventuresStore.subscribe(
    (v) => (adventure = v.find(({ id }) => page.params.id === id)),
  )
  
  onMount(() => {
    Api.reloadActivities()
    Api.reloadLodgings()
    Api.reloadTransportations()
  })
  onDestroy(adventuresUnsubscribe)
</script>
  
{#if adventure}
  <h2 class="text-xl mb-4">
    {$t('organization.organization.title', { defaultValue: 'Organization' })}
  </h2>
  <div class="flex flex-col gap-4">
    <div class="collapse collapse-arrow bg-base-100 border-base-300 border">
      <input type="checkbox" />
      <div class="collapse-title font-semibold">
        {$t('organization.organization.activities', { defaultValue: 'Activities' })}
      </div>
      <div class="collapse-content text-sm">
        {#if isEditable}
          {#if newActivity !== null}
            <ActivityForm activity={newActivity} onFinish={() => (newActivity = null)} />
          {:else}
            <button class="btn btn-primary mb-4" onclick={() => (newActivity = undefined)}>Add</button>
          {/if}
        {/if}
        <div class="flex flex-col gap-2">
          {#each adventure.activities ?? [] as activity}
            <div class="flex items-center gap-1">
              {#if isEditable}
                <button
                  type="button"
                  class="btn btn-xs btn-square"
                  disabled={newActivity?.id === activity.id}
                  onclick={() => Api.deleteActivity({ id: activity.id })}
                >
                  ✕
                </button>
                <button
                  type="button"
                  class="btn btn-xs btn-square"
                  disabled={!!newActivity}
                  onclick={() => (newActivity = {...activity})}
                >
                  <Icon icon="edit" _class="w-4 h-4" />
                </button>
              {/if}
              <p>
                {#if activity.at}<time>{formatDatetime(activity.at)}</time>{/if}
                {#if activity.location}
                  <b>
                    <Icon icon="location" _class="min-w-3 h-3" />
                    {activity.location}
                  </b>
                {/if}
                {#if activity.name}{activity.name}{/if}
                {#if activity.cost}
                  <Icon icon="cost" _class="-mb-1 ml-2 w-4 h-4" />
                  {activity.cost}
                {/if}
              </p>
            </div>
          {/each}
        </div>
      </div>
    </div>
    <div class="collapse collapse-arrow bg-base-100 border-base-300 border">
      <input type="checkbox" />
      <div class="collapse-title font-semibold">
        {$t('organization.organization.transportations', { defaultValue: 'Transportations' })}
      </div>
      <div class="collapse-content text-sm">
        {#if isEditable}
          {#if newTransportation !== null}
            <TransportationForm transportation={newTransportation} onFinish={() => (newTransportation = null)} />
          {:else}
            <button class="btn btn-primary mb-4" onclick={() => (newTransportation = undefined)}>Add</button>
          {/if}
        {/if}

        <div class="flex flex-col gap-2">
          {#each adventure.transportations ?? [] as transportation}
            <div class="flex items-center gap-1">
              {#if isEditable}
                <button
                  type="button"
                  class="btn btn-xs btn-square"
                  disabled={newTransportation?.id === transportation.id}
                  onclick={() => Api.deleteTransportation({ id: transportation.id })}
                >
                  ✕
                </button>
                <button
                  type="button"
                  class="btn btn-xs btn-square"
                  disabled={!!newTransportation}
                  onclick={() => (newTransportation = {...transportation})}
                >
                  <Icon icon="edit" _class="w-4 h-4" />
                </button>
              {/if}

              <Icon icon="transportations/{transportation.type}" _class="mx-2 w-5 h-5 text-secondary" />
              <p>
                {#if transportation.from}{transportation.from}{/if}
                {#if transportation.from_at}<time>{formatDatetime(transportation.from_at)}</time>{/if}
                {#if transportation.to_at}- <time>{formatDatetime(transportation.to_at)}</time>{/if}
                {#if transportation.to}{transportation.to}{/if}
                {#if transportation.from || transportation.from_at || transportation.to || transportation.to_at}
                  <span class="mx-2">|</span>
                {/if}
                {#if transportation.company}{transportation.company}{/if}
                {#if transportation.reservation}<small>({transportation.reservation})</small>{/if}
                {#if transportation.cost}
                  <Icon icon="cost" _class="-mb-1 ml-2 w-4 h-4" />
                  {transportation.cost}
                {/if}
              </p>
            </div>
          {/each}
        </div>
      </div>
    </div>
    <div class="collapse collapse-arrow bg-base-100 border-base-300 border">
      <input type="checkbox" />
      <div class="collapse-title font-semibold">
        {$t('organization.organization.lodgings', { defaultValue: 'Lodgings' })}
      </div>
      <div class="collapse-content text-sm">
        {#if isEditable}
          {#if newLodging !== null}
            <LodgingForm lodging={newLodging} onFinish={() => (newLodging = null)} />
          {:else}
            <button class="btn btn-primary mb-4" onclick={() => (newLodging = undefined)}>Add</button>
          {/if}
        {/if}
        <div class="flex flex-col gap-2">
          {#each adventure.lodgings ?? [] as lodging}
            <div class="flex items-center gap-1">
              {#if isEditable}
                <button
                  type="button"
                  class="btn btn-xs btn-square"
                  disabled={newLodging?.id === lodging.id}
                  onclick={() => Api.deleteLodging({ id: lodging.id })}
                >
                  ✕
                </button>
                <button
                  type="button"
                  class="btn btn-xs btn-square"
                  disabled={!!newLodging}
                  onclick={() => (newLodging = {...lodging})}
                >
                  <Icon icon="edit" _class="w-4 h-4" />
                </button>
              {/if}

              {#if lodging.company?.toLowerCase()?.includes('airbnb')}
                <Icon icon="airbnb" _class="mx-2 w-5 h-5 text-secondary" />
              {:else}
                <Icon icon="hotel" _class="mx-2 w-5 h-5 text-secondary" />
              {/if}
              <p>
                {#if lodging.from_at}<time>{formatDatetime(lodging.from_at)}</time>{/if}
                {#if lodging.to_at}- <time>{formatDatetime(lodging.to_at)}</time>{/if}
                {#if  lodging.location}
                  <b>
                    <Icon icon="location" _class="min-w-3 h-3" />
                    {lodging.location}
                  </b>
                {/if}
                {#if lodging.company}{lodging.company}{/if}
                {#if lodging.reservation}<small>({lodging.reservation})</small>{/if}
                {#if lodging.cost}
                  <Icon icon="cost" _class="-mb-1 ml-2 w-4 h-4" />
                  {lodging.cost}
                {/if}
              </p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}
    