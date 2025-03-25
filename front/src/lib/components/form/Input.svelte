<script lang="ts">
let {
  _class,
  id,
  type = 'text',
  placeholder = '',
  value = $bindable(),
  disabled = false,
  required = false,
  errors,
  onClick,
} = $props<{
  value?: string
  checked?: boolean
  placeholder?: string
  id: string
  type?: string
  disabled?: boolean
  required?: boolean
  errors?: any
  onClick?: () => void
  _class?: string
}>()
</script>

<div class="form-control w-full">
  <input
    class={_class ?? "input input-bordered w-full"}
    {type}
    {placeholder}
    {required}
    {disabled}
    {id}
    name={id}
    bind:value={value}
    onclick={onClick}
  />
  {#if errors}
    {#each errors as error}
      <label for={id} class="max-w-full text-error py-0 pt-1">
        {error}
      </label>
    {/each}
  {/if}
</div>
