<script lang="ts">
import { fade, slide } from 'svelte/transition'
export let message = 'New message arrived.'
export let type = 'success'
export let x = 'center'
export let y = 'top'
export let show = false
</script>

{#if show}
  <div
    in:slide={{ duration: 300 }}
    out:fade={{ duration: 300 }}
    class={`z-50 mt-16 toast toast-${x} toast-${y}`}
  >
    <div class={`shadow-lg border border-${type}-content alert alert-${type}`}>
      <div class={`flex items-center gap-2 text-${type}-content`}>
        <div>
          {#if type === 'success'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current flex-shrink-0 h-7 w-7 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          {:else}
            icon
          {/if}
        </div>
        <div>{message}</div>
      </div>
    </div>
  </div>
{/if}
