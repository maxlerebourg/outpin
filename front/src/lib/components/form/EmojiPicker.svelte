<script lang="ts">
import { t } from '$lib/i18n'
import { clickOutside } from '$lib/utils'

let { value = $bindable() } = $props<{ value: string | null }>()
const emojis = [
  '😂',
  '😝',
  '😁',
  '😱',
  '😍',
  '😉',
  '😓',
  '😳',
  '😘',
  '😜',
  '😵',
  '😡',
  '👿',
  '👶',
  '👸',
  '✌️',
  '👉',
  '🙌',
  '👌',
  '💪',
  '🙏',
  '👋',
  '👊',
  '🎈',
  '🌹',
  '💄',
  '🎀',
  '🏁',
  '🐟',
  '🍀',
  '👀',
  '🍎',
  '💝',
  '💙',
  '❤',
  '💖',
  '💘',
  '💜',
  '💛',
  '💚',
  '💩',
  '🔑',
  '🌟',
  '🎉',
  '🌺',
  '🎶',
  '👠',
  '🍸',
  '⚽',
  '🎾',
  '🏈',
  '⚾',
  '🏀',
  '🎱',
  '🏆',
  '👽',
  '💀',
  '🐵',
  '🐮',
  '🐩',
  '🐎',
  '🐻',
  '🐶',
  '🐬',
  '🐰',
  '🐷',
  '🐍',
  '🐫',
  '💣',
  '👃',
  '👂',
  '🍓',
  '💋',
  '🚽',
  '💃',
  '💎',
  '🎁',
  '💰',
  '🔫',
  '👄',
  '🚲',
  '🍻',
  '🔥',
  '🌈',
  '☀️',
  '🌙',
  '🍉',
  '⛄',
  '🌊',
  '🚗',
  '🚌',
  '🏎️',
  '🚓',
  '🚑',
  '🚒',
  '🚐',
  '🚝',
  '✈️',
  '🛴',
  '🚀',
  '⛵',
  '🛶',
  '🚁',
  '🎡',
  '🏖️',
  '🏛️',
  '⛩️',
  '🛕',
  '📷',
]
let displayed = $state(false)

function onChangeEmoji(emoji: string | null) {
  value = emoji
  displayed = false
}
function openEmojiPicker(evt?: Event) {
  if (evt) prevention(evt)
  displayed = !displayed
}
function prevention(evt: Event) {
  evt.preventDefault()
  evt.stopPropagation()
}
</script>

<div class="relative z-10">
  <button
    type="button"
    class="-mx-2 btn btn-sm btn-square text-lg!"
    onclick={openEmojiPicker}
  >
    {value}
  </button>
  {#if displayed}
    <div
      class="card absolute w-sm max-w-[70vw] max-h-35 -left-2 bottom-full px-2 py-1 bg-base-200 overflow-auto"
      style="font-size: 30px"
      role="button"
      onclick={prevention}
      onkeyup={prevention}
      tabindex="-1"
      use:clickOutside={() => displayed ? openEmojiPicker() : undefined}
    >
      <button class="btn btn-sm btn-ghost" onclick={() => onChangeEmoji(null)}>
        {$t('emoji-picker.submit-null', { defaultValue: 'No emoji' })}
      </button>
      <div class="flex flex-wrap">
        {#each emojis as emoji}
          <button
            class="btn btn-sm btn-square btn-ghost text-lg!"
            onclick={() => onChangeEmoji(emoji)}
          >
            {emoji}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
