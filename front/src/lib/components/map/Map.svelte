<script lang="ts">
import {
  MapEvents,
  MapLibre,
  Marker,
  type MarkerMouseEvent,
} from 'svelte-maplibre'

import Icon from '../Icon.svelte'
import ClusterMarker from './ClusterMarker.svelte'

let { center, marker, onMarkerChange } = $props<{
  center: [number, number]
  marker: { lngLat: LngLat }
  onMarkerChange: (l: LngLat) => void
} | null>()

async function addMarker(evt: MarkerMouseEvent | any) {
  if (
    evt.originalEvent &&
    evt.originalEvent.target.nodeName?.toLowerCase() !== 'canvas'
  )
    return
  await onMarkerChange(evt.lngLat)
}
</script>

<MapLibre
	style="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
	class="relative w-full h-[calc(100vh-64px)]"
	standardControls="top-right"
	center={[2, 47]}
	zoom={5}
>
	<ClusterMarker {center}  />
	<MapEvents onclick={addMarker} />
	{#if marker}
		<Marker lngLat={marker.lngLat} class="z-10 text-info flex justify-center items-center -translate-y-4">
			<Icon icon="location" _class="h-8 w-8" onClick={() => onMarkerChange(marker.lngLat)} />
		</Marker>
	{/if}
</MapLibre>
