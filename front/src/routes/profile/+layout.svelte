<script lang="ts">
import { goto } from '$app/navigation'
import { Api } from '$lib/api'
import { t } from '$lib/i18n'

let { children } = $props()
</script>
  
<div class="max-w-lg mx-auto mb-4 mt-6">
  <div class="flex w-full h-full">
    <ul class="menu bg-base-100 gap-2 h-full w-40 rounded-box">
      <li>
        <a href="/profile/account" class="btn btn-ghost">
          {$t('profile.layout.account', { defaultValue: 'Account' })}
        </a>
      </li>
      <li>
        <a href="/profile/security" class="btn btn-ghost">
          {$t('profile.layout.security', { defaultValue: 'Security' })}
        </a>
      </li>
      <li>
        <button
          type="button"
          class="btn btn-ghost"
          onclick={() => {
            Api.logout()
            goto('/auth/login')
          }}
        >
          {$t('profile.layout.submit-logout', { defaultValue: 'Logout' })}
        </button>
      </li>
    </ul>
    <div class="w-full max-w-lg px-2">
      {@render children?.()}
    </div>
  </div>
</div>
  