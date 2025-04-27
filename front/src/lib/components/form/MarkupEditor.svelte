<script lang="ts">
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { onMount } from 'svelte'

import { t } from '$lib/i18n'

import Icon from '../Icon.svelte'

const DEFAULT_VALUE = $t('markup-editor.default-value', {
  defaultValue: 'No description',
})

// Thanks to https://github.com/Sirneij/devto-editor-clone
let contentText = $state<HTMLTextAreaElement>()
let { contentValue = DEFAULT_VALUE, isEditable = false, onSave } = $props<{
  contentValue?: string
  isEditable?: boolean
  onSave: (s: string) => Promise<void>
}>()
let showPreview = $state(true)
let markup = $state('')
let lastDate = $state<number>(0)
let timeout = $state<number>(0)
const initialValue = contentValue

function setCaretPosition(
  ctrl: HTMLTextAreaElement,
  startPos: number,
  endPos: number,
) {
  if (ctrl.setSelectionRange) {
    ctrl.focus()
    ctrl.setSelectionRange(startPos, endPos)
  }
}

async function parseMarkdown(text: string): Promise<string> {
  marked.setOptions({
    renderer: new marked.Renderer(),
    pedantic: false,
    gfm: true,
    breaks: false,
  })

  return DOMPurify.sanitize(await marked.parse(text))
}

function updateTextAreaValue(
  contentTextArea?: HTMLTextAreaElement,
  text: string = '',
  posStart: number = 0,
  posEnd = 0,
) {
  if (contentTextArea) {
    const start = contentTextArea.selectionStart + posStart
    let end = start + posEnd
    if (posEnd === 0) {
      end = contentTextArea.selectionStart + posStart
    }
    contentTextArea.value = `${contentTextArea.value.slice(
      0,
      contentTextArea.selectionStart,
    )}${text}${contentTextArea.value.slice(contentTextArea.selectionStart)}`
    // console.log(`Test: ${text}, Start: ${start}, End: ${end}`);
    setCaretPosition(contentTextArea, start, end)
  }
}
function useKeyCombinations(
  event: Event,
  contentTextArea?: HTMLTextAreaElement,
) {
  const keysPressed: Record<string, boolean> = {}
  event.target?.addEventListener('keydown', (evt) => {
    const keyEvent = evt as KeyboardEvent
    keysPressed[keyEvent.key] = true
    if (keysPressed.Control || keysPressed.Meta) {
      switch (keyEvent.key) {
        case 'b':
          evt.preventDefault()
          addBoldCommand(contentTextArea)
          break
        case 'i':
          evt.preventDefault()
          addItalicCommand(contentTextArea)
          break
        case 'k':
          evt.preventDefault()
          addLinkCommand(contentTextArea)
          break
      }
    }
  })
  event.target?.addEventListener(
    'keyup',
    (e) => (keysPressed[(e as KeyboardEvent).key] = false),
  )
}
async function throttle(contentTextArea?: HTMLTextAreaElement) {
  clearTimeout(timeout)
  timeout = setTimeout(async () => {
    if (Date.now() - lastDate > 1000) await onSave(contentTextArea?.value)
  }, 2000)
  lastDate = Date.now()
}

function addBoldCommand(contentTextArea?: HTMLTextAreaElement) {
  const text = `**text**`
  if (contentTextArea && contentTextArea.value.indexOf(text) !== -1) {
    contentTextArea.value = contentTextArea.value.replace(text, '')
  } else {
    updateTextAreaValue(contentTextArea, text, 2, 4)
  }
}
function addItalicCommand(contentTextArea?: HTMLTextAreaElement) {
  const text = `*text*`
  if (contentTextArea && contentTextArea.value.indexOf(text) !== -1) {
    contentTextArea.value = contentTextArea.value.replace(text, '')
  } else {
    updateTextAreaValue(contentTextArea, text, 1, 4)
  }
}
function addLinkCommand(contentTextArea?: HTMLTextAreaElement) {
  const text = `[text](link)`
  if (contentTextArea && contentTextArea.value.indexOf(text) !== -1) {
    contentTextArea.value = contentTextArea.value.replace(text, '')
  } else {
    updateTextAreaValue(contentTextArea, text, 1, 4)
  }
}
function addUnorderedListCommand(contentTextArea?: HTMLTextAreaElement) {
  const text = `\n- First item\n- Second item\n`
  if (contentTextArea && contentTextArea.value.indexOf(text) !== -1) {
    contentTextArea.value = contentTextArea.value.replace(text, '')
  } else {
    updateTextAreaValue(
      contentTextArea,
      text,
      `\n- `.length,
      `First item`.length,
    )
  }
}
function addOrderedListCommand(contentTextArea?: HTMLTextAreaElement) {
  const text = `\n1. First item\n2. Second item\n`
  if (contentTextArea && contentTextArea.value.indexOf(text) !== -1) {
    contentTextArea.value = contentTextArea.value.replace(text, '')
  } else {
    updateTextAreaValue(
      contentTextArea,
      text,
      `\n1. `.length,
      `First item`.length,
    )
  }
}
function addHeadingCommand(
  contentTextArea?: HTMLTextAreaElement,
  hNumber: number = 2,
) {
  const text = `\n${new Array(hNumber).fill('#').join('')} text\n\n`
  if (contentTextArea && contentTextArea.value.indexOf(text) !== -1) {
    contentTextArea.value = contentTextArea.value.replace(text, '')
  } else {
    updateTextAreaValue(contentTextArea, text, hNumber + 2, 4)
  }
}
function addCodeBlockCommand(contentTextArea?: HTMLTextAreaElement) {
  const text = '\n```language\ntext\n```\n'
  if (contentTextArea && contentTextArea.value.indexOf(text) !== -1) {
    contentTextArea.value = contentTextArea.value.replace(text, '')
  } else {
    updateTextAreaValue(contentTextArea, text, '\n```language\n'.length, 4)
  }
}

async function handlePreview(toggle = true) {
  markup = await parseMarkdown(contentValue)
  if (toggle) showPreview = !showPreview
}

async function resetCommand(contentTextArea?: HTMLTextAreaElement) {
  if (contentTextArea) contentTextArea.value = initialValue
  throttle(contentTextArea)
}

onMount(() => handlePreview(false))
</script>

<div class="min-h-12">
  {#if isEditable}
    <div class="card menu menu-horizontal w-full mb-2 {showPreview ? '' : 'bg-base-300'}">
      {#if !showPreview}
        <button
          type="button"
          class="btn btn-ghost btn-square btn-sm tooltip"
          data-tip="Bold [Cmd/Ctrl(Shift) + B]"
          onclick={() => addBoldCommand(contentText)}
        >
          <b>b</b>
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-square btn-sm tooltip"
          data-tip="Italics [Cmd/Ctrl(Shift) + I]"
          onclick={() => addItalicCommand(contentText)}
        >
          <i>i</i>
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-square btn-sm tooltip"
          data-tip="Add link [Cmd/Ctrl(Shift) + K]"
          onclick={() => addLinkCommand(contentText)}
        >
          @
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-square btn-sm tooltip"
          data-tip="Add unordered list"
          onclick={() => addUnorderedListCommand(contentText)}
        >
          •••
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-square btn-sm tooltip"
          data-tip="Add ordered list"
          onclick={() => addOrderedListCommand(contentText)}
        >
          123
        </button>
        <div class="flex">
          <input id="peer" type="checkbox" class="peer hidden"/>
          <label for="peer" class="btn btn-square btn-sm btn-ghost peer-checked:hidden">h›</label>
          <label for="peer" class="btn btn-square btn-sm hidden peer-checked:flex">h‹</label>
          {#each [2, 3, 4, 5, 6] as hNumber}
            <button
              type="button"
              class="btn btn-ghost btn-square btn-sm hidden peer-checked:flex"
              onclick={() => addHeadingCommand(contentText, hNumber)}
            >
              h{hNumber}
            </button>
          {/each}
        </div>

        <button
          type="button"
          class="btn btn-ghost btn-square btn-sm tooltip"
          data-tip="Code block command"
          onclick={() => addCodeBlockCommand(contentText)}
        >
          ‹ ›
        </button>
        <button type="button" class="btn btn-sm px-1" onclick={() => resetCommand(contentText)}>
          reset
        </button>
      {/if}
      <button
        type="button"
        class="btn btn-square btn-sm ml-auto"
        onclick={() => handlePreview()}
      >
        <Icon icon="edit" _class="w-4 h-4" />
      </button>
    </div>

    {#if !showPreview}
      <textarea
        bind:this={contentText}
        bind:value={contentValue}
        onfocus={(evt) => evt.target && useKeyCombinations(evt, contentText)}
        onchange={() => throttle(contentText)}
        name="content"
        class="textarea w-full"
        id="textAreaContent"
        data-input-field
        required
        rows="15"
      ></textarea>
    {:else if contentValue === DEFAULT_VALUE}
      <div class="-mt-13 min-h-10 flex items-center text-sm">
        <i>{DEFAULT_VALUE}</i>
      </div>
    {:else}
      <div class="-mt-13 marked">
        {@html markup}
      </div>
    {/if}
  {:else}
  <div class="marked">
    {@html markup}
  </div>
  {/if}
</div>

