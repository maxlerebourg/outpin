<script lang="ts">
let {
  id,
  value = $bindable(),
  disabled = false,
  _class,
} = $props<{
  id: string
  value: number | null
  disabled?: boolean
  _class?: string
}>()
</script>

<div class="flex items-center gap-1 {disabled ? 'pointer-events-none' : ''}">
  {#if value > 0 && !disabled}
    <button
      type="button"
      class="btn btn-square btn-xs"
      onclick={() => (value = null)}
    >
      ✕
    </button>
  {/if}
  <div class="rating rating-xs {_class}">
    {#each [1, 2, 3, 4, 5] as rate}
      <input
        type="radio"
        name={id}
        class="mask mask-star-2 bg-secondary"
        onclick={() => (value = rate)}
        checked={value === rate}
      />
    {/each}
  </div>
</div>
