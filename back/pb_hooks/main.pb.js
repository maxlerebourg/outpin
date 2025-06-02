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
  "/api/self",
  (c) => {
    const trustedHeaderEmail = $os.getenv('TRUSTED_HEADER_EMAIL')
    if (!trustedHeaderEmail) return c.json(200, {})
      
    const email = c.request.header.get(trustedHeaderEmail)
    if (!email) return c.json(200, {})
    let user
    try {
      user = $app.findAuthRecordByEmail('users', email)
      return $apis.recordAuthResponse(c, user)
    } catch(err) {
      console.log('err', err)
    }

    if (user) return c.json(200, {})
    try {
      const users = $app.findCollectionByNameOrId('users')
      const record = new Record(users)
    
      record.set('email', email)
      record.set('password', $security.randomStringByRegex('[A-Za-z0-9]{8}'))

      $app.save(record)
      user = $app.findAuthRecordByEmail('users', email)
      return $apis.recordAuthResponse(c, user)
    } catch (err) {
      console.log('err', err)
    }
    c.json(200, {})
  },
)

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
