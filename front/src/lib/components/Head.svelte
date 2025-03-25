<script lang="ts">
import { page } from '$app/state'

let { title = '', description = '', image = '' } = $props()
let canonical = $state<string>('')
$effect(() => {
  canonical = `${window.location.host}${page.url.pathname}`
})
</script>

<svelte:head>
	<title>{title}</title>
	<link rel="canonical" href={canonical} />
	<meta property="og:url" content={window.location.host} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={title} />
	<meta name="Description" content={description} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
	<!-- <script type="application/ld+json">
	{
		"@context":"https://schema.org",
		"@graph":[{
			"@type":"WebSite",
			"@id":"{{ SITE_URL }}/#website",
			"url":"{{ SITE_URL }}",
			"name":"AlcoDico 🎲",
			"description":"Découvrez les meilleurs jeux de soirée !",
			"inLanguage":"fr-FR"
		},
		{
			"@type":"BreadcrumbList",
			"@id":"{{ SITE_URL }}#breadcrumb",
			"itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil"}]
    }]
  }
  </script> -->
</svelte:head>
