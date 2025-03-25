import * as fs from 'fs'
import * as path from 'path'

function readJsonFile(filePath: string): any {
  const data = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(data)
}

function getJsonKeys(jsonObject: any): Set<string> {
  const keys = new Set<string>()
  function extractKeys(obj: any, parentKey: string = '') {
    if (obj !== null && typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const fullKey = parentKey ? `${parentKey}.${key}` : key
          keys.add(fullKey)
          extractKeys(obj[key], fullKey)
        }
      }
    }
  }
  extractKeys(jsonObject)
  return keys
}

function listJsonFiles(directory: string): string[] {
  const files = fs.readdirSync(directory)
  return files.filter((file: string) => path.extname(file) === '.json')
}

function checkJsonFiles(directory: string, originalFileName: string) {
  const originalFilePath = path.join(directory, originalFileName)
  if (!fs.existsSync(originalFilePath)) {
    throw new Error(`File ${directory}/${originalFileName} not found`)
  }

  const originalJson = readJsonFile(originalFilePath)
  const originalKeys = getJsonKeys(originalJson)

  const jsonFiles = listJsonFiles(directory)
  let filesNotOk: string[] = []
  jsonFiles.forEach((file) => {
    if (file === originalFileName) return

    const filePath = path.join(directory, file)
    const json = readJsonFile(filePath)
    const keys = getJsonKeys(json)
    const missingKeys = [...originalKeys].filter((key) => !keys.has(key))

    if (missingKeys.length > 0) {
      const max = 10
      console.log(
        `File: ${file} - Missing keys: '${missingKeys.slice(0, max).join("', '")}'${missingKeys.length > max ? ` and ${missingKeys.length - max} others` : ''}`,
      )
      filesNotOk.push(file)
    } else {
      console.log(`File: ${file} - OK`)
    }
  })
  if (filesNotOk.length !== 0)
    throw new Error(
      `Files '${filesNotOk.join("', '")}' do not contains same keys as original`,
    )
}

const directory = `${process.cwd()}/static/lang`
const originLocale =
  process.argv
    .find((a: string) => a.startsWith('--originLang='))
    ?.split('=')[1] ?? 'en'
const originFileName = `${originLocale}.json`
try {
  checkJsonFiles(directory, originFileName)
} catch (err) {
  console.log(err.message)
  process.exit(1)
}
