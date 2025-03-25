<script lang="ts">
import { MapLibre, Marker } from 'svelte-maplibre'
import Icon from '../Icon.svelte'

let { marker } = $props<{ marker: LngLat }>()
</script>

<MapLibre
  style="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
  class="relative w-full h-full aspect-video card"
  standardControls={false}
  center={[marker.lng, marker.lat]}
  zoom={11}
  attributionControl={false}
>
  <Marker lngLat={marker} class="text-blue-300">
    <Icon icon="location" _class="h-8 w-8 -translate-y-4 -translate-x-1" />
  </Marker>
</MapLibre>
