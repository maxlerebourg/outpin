// Extending PocketBase with JS - @see https://pocketbase.io/docs/js-overview/

/// <reference path="../pb_data/types.d.ts" />

routerUse((c) => {
  try {
    c.next()
  } catch (err) {
    if (err.value?.status == 404) {
      c.fileFS($os.dirFS('/pb/pb_static'), '404.html')
      return
    }
    throw err // rethrow
  }
})

routerAdd(
  "GET",
  "/api/geocoding/reverse",
  (c) => {
    const lat = c.request.url.query().get('lat')
    const lng = c.request.url.query().get('lng')
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    const response = $http.send({ url, headers: { 'Accept-Language': 'en-US' } })
    const data = response.json
    // console.log(JSON.stringify(data, null, 1))
    c.json(200, {
      city:  data.address?.town ?? data.address?.village ?? data.address?.municipality ?? data.address?.city,
      state: data.address?.county ?? data.address?.state ?? data.address?.suburb ?? data.address?.province,
      postCode: data.address?.postcode,
      country: data.address?.country,
      latitude: Number(lat),
      longitude: Number(lng),
    })
  },
)

routerAdd(
  "GET",
  "/api/geocoding/search",
  (c) => {
    const q = c.request.url.query().get('q')
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&q=${q}}`
    const response = $http.send({ url, headers: { 'Accept-Language': 'en-US' } })
    const data = response.json?.[0] ?? {}
    // console.log(JSON.stringify(data, null, 1))
    c.json(200, {
      city:  data.address?.town ?? data.address?.village ?? data.address?.municipality ?? data.address?.city,
      state: data.address?.county ?? data.address?.state ?? data.address?.suburb ?? data.address?.province,
      postCode: data.address?.postcode,
      country: data.address?.country,
      latitude: Number(data.lat),
      longitude: Number(data.lon),
    })
  },
)
