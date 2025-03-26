# OutPin

OutPin is a history of all your trips deployable as a Go program thanks to [PocketBase](https://pocketbase.io).  
OutPin offers a way to plan your future holidays by creating adventures and adding steps to them.


## Installation

Run the Docker image provided `ghcr.io/maxlerebourg/outpin`.

The default port is 8090, but it can be overridden using the Docker CMD argument with `--http=http://0.0.0.0:9999`

All data is stored in the `/pb_data` folder.

Don’t forget to use PocketBase’s built-in backup system or implement your own backup solution.


## [Demo](https://outpin.lerebourg.eu)

Email verification has been disabled, you can use any email address

The search and the pin placement can be down if some individuals use all my free quotas from [Nominatim](https://nominatim.openstreetmap.org).

The map from [Carto](https://carto.com) can be impossible to display for the same reason.


## Env

```
PB_ADMIN_EMAIL - Your superuser PocketBase email. 
PB_ADMIN_PASSWORD - Your superuser PocketBase password.
```


## Thanks

Thanks to all the wonderful project that save me a lot of time:
- [SQLite](https://www.sqlite.org)
- [PocketBase](https://pocketbase.io)
- [Tailwind](https://tailwindcss.com)
- [DaisyUI](https://daisyui.com)
- [SvelteKit](https://svelte.dev)
- [MapLibre](https://maplibre.org)


### About

I wanted to create a Go alternative to [AdventureLog](https://adventurelog.app) because I dislike Python for no particular reason and I needed a goal to use [PocketBase](https://pocketbase.io).  
At first, I wanted to use the same interface/API as AdventureLog, but as my needs evolved, I decided to take a different approach.  
As a traveler, I find it hard to remember all the trips I’ve taken, so I created an app to help me keep track of them.  
