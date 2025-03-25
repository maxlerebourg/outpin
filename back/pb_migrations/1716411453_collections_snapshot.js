migrate((app) => {
  const collections = [
    {
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1579384326",
          "max": 250,
          "min": 0,
          "name": "name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text3578368839",
          "max": 250,
          "min": 0,
          "name": "display_name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1704208859",
          "max": 4,
          "min": 0,
          "name": "icon",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "cascadeDelete": true,
          "collectionId": "_pb_users_auth_",
          "hidden": false,
          "id": "relation2809058197",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "user_id",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        }
      ],
      "id": "pbc_3292755704",
      "indexes": [],
      "listRule": null,
      "name": "categories",
      "system": false,
      "type": "base",
      "createRule": "null != @request.auth.id",
      "deleteRule": "user_id = @request.auth.id",
      "listRule": "user_id = @request.auth.id",
      "updateRule": "user_id = @request.auth.id",
      "viewRule": "user_id = @request.auth.id"
    },
    {
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1579384326",
          "max": 250,
          "min": 0,
          "name": "name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1843675174",
          "max": 0,
          "min": 0,
          "name": "description",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "number3632866850",
          "max": 5,
          "min": 0,
          "name": "rating",
          "onlyInt": true,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "date2502384312",
          "max": "",
          "min": "",
          "name": "start_date",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "date"
        },
        {
          "cascadeDelete": true,
          "collectionId": "_pb_users_auth_",
          "hidden": false,
          "id": "relation2809058197",
          "maxSelect": 999,
          "minSelect": 0,
          "name": "user_id",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_3292755704",
          "hidden": false,
          "id": "relation306617826",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "category_id",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        }
      ],
      "id": "pbc_1973380996",
      "indexes": [],
      "listRule": null,
      "name": "adventures",
      "system": false,
      "type": "base",
      "createRule": "null != @request.auth.id",
      "deleteRule": "user_id.id = @request.auth.id",
      "listRule": "user_id.id = @request.auth.id",
      "updateRule": "user_id.id = @request.auth.id",
      "viewRule": "user_id.id = @request.auth.id"
    },
    {
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text18589324",
          "max": 0,
          "min": 0,
          "name": "notes",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1587448267",
          "max": 250,
          "min": 0,
          "name": "location",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "number1092145443",
          "max": null,
          "min": null,
          "name": "latitude",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number1092145448",
          "max": null,
          "min": 0,
          "name": "day_duration",
          "onlyInt": true,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number2246143851",
          "max": null,
          "min": null,
          "name": "longitude",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number3632866855",
          "max": 5,
          "min": 0,
          "name": "rating",
          "onlyInt": true,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number3632866856",
          "max": 5,
          "min": 0,
          "name": "order",
          "onlyInt": true,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "cascadeDelete": true,
          "collectionId": "pbc_1973380996",
          "hidden": false,
          "id": "relation1439645945",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "adventure_id",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": false,
          "collectionId": "pbc_3292755704",
          "hidden": false,
          "id": "relation306617827",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "category_id",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        }
      ],
      "id": "pbc_1935361188",
      "indexes": [],
      "listRule": null,
      "name": "visits",
      "system": false,
      "type": "base",
      "createRule": "adventure_id.user_id.id = @request.auth.id",
      "deleteRule": "adventure_id.user_id.id = @request.auth.id",
      "listRule": "adventure_id.user_id.id = @request.auth.id",
      "updateRule": "adventure_id.user_id.id = @request.auth.id",
      "viewRule": "adventure_id.user_id.id = @request.auth.id"
    }
  ]
  collections.map((item) => app.save(new Collection(item)));

  let superusers = app.findCollectionByNameOrId("_superusers")
  let record = new Record(superusers)

  const email = $os.getenv('PB_ADMIN_EMAIL')
  const randomEmail = 'admin@admin.com'
  const password = $os.getenv('PB_ADMIN_PASSWORD')
  const randomPassword = $security.randomStringByRegex('[A-Za-z0-9]{8}')
  if (!email)
    console.log(`Generated superuser email is ${randomEmail}`)
  if (!password)
    console.log(`Generated superuser password is: ${randomPassword}`)

  record.set("email", email || randomEmail)
  record.set("password", password || randomPassword)
  app.save(record)
}, (_) => { });