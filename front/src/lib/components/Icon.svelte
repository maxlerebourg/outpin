<script>
// @ts-nocheck
const imageModules = import.meta.glob('/static/icons/*.svg', {
  eager: true,
  query: {
    enhanced: true,
  },
})

let { icon, _class, onClick = undefined } = $props()
</script>

{#each Object.entries(imageModules) as [_path, module]}
  {#if _path.includes(`${icon}.svg`)}
    {#if onClick !== undefined}
      <span
        tabindex="0"
        onkeyup={onClick}
        onclick={onClick}
        role="button"
        style={`
          mask-size: 100%;
          mask-image: url("${module?.default ?? ''}");
          mask-repeat: no-repeat;
          mask-position: center;
        `}
        class="inline-block bg-current {_class}"
      ></span>
    {:else}
      <span
        style={`
          mask-size: 100%;
          mask-image: url("${module?.default ?? ''}");
          mask-repeat: no-repeat;
          mask-position: center;
        `}
        class="inline-block bg-current {_class}"
      ></span>
    {/if}
  {/if}
{/each}
