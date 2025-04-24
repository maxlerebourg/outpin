<script lang="ts">
import { onDestroy } from 'svelte'
import {
  getMapContext,
  GeoJSON,
  LineLayer,
  MarkerLayer,
  Popup,
  MapEvents,
} from 'svelte-maplibre'
import { t } from '$lib/i18n'
import { adventuresStore } from '$lib/store'
import Rating from '../form/Rating.svelte'

const { map } = $derived(getMapContext())
let { center, onMoveEnd } = $props<{
  center: [number, number]
  onMoveEnd: (e: LngLat) => void
}>()

let innerFeaturesPromise = $derived.by(async () => {
  if (!map) return {}
  const featureLines: any[] = []
  const featurePoints: any[] = []
  adventures.map((adventure: Adventure) => {
    const visits: Visit[] = adventure?.visits ?? []
    visits.map((visit, i) => {
      if (!visit.longitude || !visit.latitude) return
      featurePoints.push({
        type: 'Feature',
        properties: { id: visit.id, adventure, visit },
        geometry: {
          type: 'Point',
          coordinates: [visit.longitude, visit.latitude],
        },
      })
      let j
      for (
        j = i + 1;
        j < visits.length && visit.adventure_id !== visits[j].adventure_id;
        j++
      );
      if (j < visits?.length) {
        featureLines.push({
          type: 'Feature',
          properties: { id: `${visit.id}-${visits[j].id}` },
          geometry: {
            type: 'LineString',
            coordinates: [
              [visit.longitude, visit.latitude],
              [visits[j].longitude, visits[j].latitude],
            ],
          },
        })
      }
    })
  })
  return { featureLines, featurePoints }
})

$effect(() => {
  innerFeaturesPromise.then((f) => {
    lines.features = f.featureLines ?? []
    points.features = f.featurePoints ?? []
  })
})
$effect(() => {
  if (!center) return
  map.flyTo({ center })
})

function onMove() {
  onMoveEnd(map.getCenter())
}

let lines = $state<any>({ type: 'FeatureCollection', features: [] })
let points = $state<any>({ type: 'FeatureCollection', features: [] })
let adventures = $state<Adventure[]>([])
const adventuresUnsubscribe = adventuresStore.subscribe((v) => {
  adventures = v
})
onDestroy(adventuresUnsubscribe)
</script>

<MapEvents onmoveend={onMove} />
<GeoJSON id="lines" data={lines}>
  <LineLayer
    layout={{ 'line-cap': 'round', 'line-join': 'round' }}
    paint={{ 'line-color': 'orange', 'line-width': 1 }}
    beforeLayerType="symbol"
  />
</GeoJSON>
<GeoJSON
  id="points"
  data={points}
  cluster={{ radius: 20, properties: { total_mag: ['+', ['get', 'mag']] } }}
>
  <MarkerLayer asButton applyToClusters>
    {#snippet children({ feature })}
      <div class="indicator flex items-center justify-center h-8 w-8 border-2 border-gray-200 rounded-full p-1 bg-accent">
        <span class="indicator-item badge badge-xs px-1 badge-secondary">{feature.properties?.point_count ?? 0}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M14 11.5A2.5 2.5 0 0 0 16.5 9A2.5 2.5 0 0 0 14 6.5A2.5 2.5 0 0 0 11.5 9a2.5 2.5 0 0 0 2.5 2.5 M14 2c3.86 0 7 3.13 7 7c0 5.25-7 13-7 13S7 14.25 7 9a7 7 0 0 1 7-7M5 9c0 4.5 5.08 10.66 6 11.81L10 22S3 14.25 3 9c0-3.17 2.11-5.85 5-6.71C6.16 3.94 5 6.33 5 9Z" />
        </svg>
      </div>
    {/snippet}
  </MarkerLayer>

  <MarkerLayer asButton applyToClusters={false}>
    {#snippet children({ feature })}
      {@const props = feature.properties}
      {@const adventure = JSON.parse(props?.adventure) ?? {}}
      {@const visit = JSON.parse(props?.visit) ?? {}}
      <div class="indicator flex items-center justify-center h-8 w-8 border-2 border-gray-200 rounded-full p-1 {(visit.status === 'past' && 'bg-secondary') || (visit.status === 'current' && 'bg-warning') || 'bg-info'}">
        <span class="indicator-item badge badge-xs px-1 badge-primary">{visit.order + 1}</span>
        <span class="text-xl">{visit.category?.icon || adventure.category?.icon || ''}</span>
      </div>
      <Popup openOn="click" offset={[0, -10]}>
        <h3 class="text-lg text-black font-bold" title={visit.location}>
          {`${visit.location?.slice(0,20)}${(visit.location?.length ?? 0) > 20 ? '...' : ''}`}
        </h3>
        {#if visit.rating}
          <Rating id="disabled-visit-rating" disabled={true} value={visit.rating} />
        {/if}
        <p class="font-semibold text-black text-md">
          {#if visit.status === 'past'}
            {$t('cluster-marker.past', { defaultValue: 'visited' })}
          {:else if visit.status === 'current'}
            {$t('cluster-marker.current', { defaultValue: 'currently' })}
          {:else}
            {$t('cluster-marker.future', { defaultValue: 'planned' })}
          {/if}
        </p>
        {#if visit.start_date || visit.end_date}
          <p class="text-black text-xs">
            {visit.start_date
              ? new Date(visit.start_date).toLocaleDateString(undefined, { timeZone: 'UTC' })
              : ''}
            {visit.end_date && visit.end_date !== visit.start_date
              ? ` - ${new Date(visit.end_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}`
              : ''}
          </p>
        {/if}
        <a class="btn btn-sm w-full mt-4" href="/adventures/{visit.adventure_id}/">
          {$t('cluster-marker.submit-details', { defaultValue: 'details' })}
        </a>
      </Popup>
    {/snippet}
  </MarkerLayer>
</GeoJSON>
