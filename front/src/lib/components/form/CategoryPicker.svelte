<script lang="ts">
import { categoriesStore } from '$lib/store'
import { onDestroy } from 'svelte'
import Icon from '../Icon.svelte'
import EmojiPicker from './EmojiPicker.svelte'
import { Api, FormError } from '$lib/api'
import { t } from '$lib/i18n'

let {
  id,
  value = $bindable(),
  noCreate = false,
} = $props<{
  id: string
  value: string | null
  noCreate?: boolean
}>()
let categories = $state<Category[]>([])
let loading = $state<boolean>(false)
let errors = $state<Record<string, string> | null>()

let newCategory = $state<Category>(createCategory())
function createCategory(): Category {
  return {
    id: '',
    name: null,
    display_name: '',
    icon: '✨',
    user_id: '',
  }
}
async function addCategory() {
  loading = true
  try {
    const category = await Api.postCategory(newCategory)
    value = category.id
    errors = null
    newCategory = createCategory()
  } catch (err) {
    if (err instanceof FormError) errors = err.errors as Record<string, string>
  }
  loading = false
}

const categoriesUnsubscribe = categoriesStore.subscribe(
  (v: Category[]) => (categories = v),
)
onDestroy(categoriesUnsubscribe)
</script>

<label class="select w-full">
  <Icon icon="category" _class="w-4 h-4 -ml-1 opacity-70" />
  <select {id} bind:value={value}>
    <option value={null}>
      {$t('category-picker.select-category-null', { defaultValue: 'No category' })}
    </option>
    {#if !noCreate}
      <option value="__add">
        {$t('category-picker.select-category-add', { defaultValue: 'Add a category' })}
      </option>
    {/if}
    {#each categories as category}
      <option value={category.id}>
        {category.display_name} {category.icon}
      </option>
    {/each}
  </select>
</label>
{#if value === '__add'}
  <div class="flex gap-2">
    <label for="category" class="input w-full flex items-center gap-2">
      <EmojiPicker bind:value={newCategory.icon} />
      <input
        id="category"
        type="text"
        class="grow"
        placeholder={$t('category-picker.input-category-placeholder', { defaultValue: 'Add a category' })}
        bind:value={newCategory.display_name}
      />
    </label>
    <button type="button" class="btn btn-secondary" disabled={loading} onclick={addCategory}>
      {#if loading}
        <span class="loading loading-spinner loading-md"></span>
      {:else}
      {$t('category-picker.submit', { defaultValue: 'Add' })}
      {/if}
    </button>
  </div>
{/if}
{#if errors?.display_name}<span class="text-xs text-error">{errors.display_name}</span>{/if}

<!-- <div class="flex flex-wrap gap-x-6 gap-y-2">
  <label class="flex items-center gap-2">
    <input
      {id}
      class="radio radio-xs"
      type="radio"
      checked={value === null}
      onchange={() => (value = null)}
    />
    No category
  </label>
  {#each categories.slice().sort() as category}
    <label class="flex items-center gap-2">
      <input
        {id}
        class="radio radio-xs"
        type="radio"
        checked={value === category.id}
        onchange={() => (value = category.id)}
      />
      {category.display_name}
      {category.icon}
    </label>
  {/each}
</div> -->
