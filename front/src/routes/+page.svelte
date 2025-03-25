<script lang="ts">
import { onMount } from 'svelte'
import { replaceState } from '$app/navigation'
import { page } from '$app/state'

import { Api } from '$lib/api'
import AdventureForm from '$lib/components/AdventureForm.svelte'
import { t } from '$lib/i18n'
import Icon from '$lib/components/Icon.svelte'

let address = $state<Address | null>(null)
let isFormDisplayed = $state<boolean>(false)
let marker = $state<{ lngLat: LngLat } | null>(null)
let center = $state<[number, number] | null>(null)
let search = $state<string>('')

async function onMarkerChange(lngLat: LngLat) {
  if (lngLat.lat === marker?.lngLat.lat && lngLat.lng === marker?.lngLat.lng) {
    isFormDisplayed = true
    return
  }
  marker = null
  try {
    address = await Api.getGeocodingReverse(lngLat)
    isFormDisplayed = true
    marker = { lngLat }
    const searchParams = page.url.searchParams
    searchParams.set('lat', lngLat.lat.toString())
    searchParams.set('lng', lngLat.lng.toString())
    replaceState(`/?${searchParams.toString()}`, {})
  } catch (err) {
    // Pass
  }
}
async function onAddressSearch(search: string) {
  marker = null
  try {
    if (!search) return
    address = await Api.getGeocodingSearch({ q: search })
    if (!address) return
    isFormDisplayed = true
    marker = { lngLat: { lng: address.longitude, lat: address.latitude } }
    center = [address.longitude, address.latitude]
    const searchParams = page.url.searchParams
    searchParams.set('lat', address.latitude.toString())
    searchParams.set('lng', address.longitude.toString())
    replaceState(`/?${searchParams.toString()}`, {})
  } catch (err) {
    // Pass
  }
}

async function loadMap() {
  return await import('$lib/components/map/Map.svelte')
}

onMount(() => {
  const lat = Number(page.url.searchParams.get('lat'))
  const lng = Number(page.url.searchParams.get('lng'))
  if (lat && lng) onMarkerChange({ lat, lng })
  const adventureId = page.url.searchParams.get('adventure_id')
  if (adventureId) isFormDisplayed = true
})
</script>

<div class="relative h-[calc(100vh-64px)]">
  <form
    class="z-30 absolute left-0 top-0 p-5 flex gap-2 w-[calc(100vw-32px)] sm:max-w-lg rounded-t-xl"
    onsubmit={() => onAddressSearch(search)}
  >
    <button
      type="button"
      class="btn btn-square flex justify-center items-center p-2"
      onclick={() => (isFormDisplayed = !isFormDisplayed)}
    >
      <Icon icon="arrow" _class="w-4 h-4 opacity-70 {isFormDisplayed ? 'rotate-180' : ''} transition" />
    </button>
    <label class="input flex-1 flex items-center gap-2">
      <Icon icon="location" _class="min-w-4 h-4 opacity-70" />
      <input
        class="w-full"
        type="text"
        placeholder={$t('index.input-search-placeholder', { defaultValue: 'Search a location' })}
        bind:value={search}
      />
      <button type="submit" class="btn btn-sm btn-square -mr-2">
        <Icon icon="search" _class="min-w-4 h-4 opacity-70" />
      </button>
    </label>
  </form>
  <div
		style="{isFormDisplayed ? 'transform: translate(100%, 0);' : ''}"
		class="z-20 absolute pt-18 top-0 bottom-0 right-full transition duration-300 card rounded-l-none bg-base-100 h-full w-[calc(100vw-32px)] sm:max-w-lg"
  >
    <div class="h-full w-full relative p-5 overflow-auto">
      <AdventureForm {address} onClose={() => (isFormDisplayed = false)} onSearch={onAddressSearch} />
    </div>
  </div>
	{#await loadMap() then map}
    <map.default {center} {marker} {onMarkerChange} />
  {/await}
</div>
