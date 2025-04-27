import * as fs from 'fs'
import * as path from 'path'

function readDirectoryRecursive(directory: string): string[] {
  let files: string[] = []
  const items = fs.readdirSync(directory)

  items.forEach((item: string) => {
    const fullPath = path.join(directory, item)
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(readDirectoryRecursive(fullPath))
    } else {
      files.push(fullPath)
    }
  })

  return files
}

function extractDefaultValue(jsonString: string): string | null {
  const defaultValueMatch = jsonString.match(
    /['"`]?defaultValue['"`]?: *['"`](.*)['"`]/,
  )
  return defaultValueMatch?.[1] ?? null
}

function findOccurrencesInFile(
  filePath: string,
  regex: RegExp,
): { key: string; defaultValue: any }[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const matches = fileContent.matchAll(regex)
  const occurrences: { key: string; defaultValue: any }[] = []

  for (const match of matches) {
    const key = match[1]
    const jsonString = match[2]
    const defaultValue = extractDefaultValue(jsonString)
    if (defaultValue !== null) {
      occurrences.push({ key, defaultValue })
    }
  }

  return occurrences
}

export default function findTranslations(
  defaultLocale: string,
  directory: string,
  directoryOutput: string,
) {
  const regex = /\$t\(['"`](.*?)['"`], *(\{.*?\})\)/gs
  const files = readDirectoryRecursive(directory)
  const tsAndSvelteFiles = files.filter(
    (file) => file.endsWith('.ts') || file.endsWith('.svelte'),
  )
  const result: { [key: string]: any } = {}

  tsAndSvelteFiles.forEach((file) => {
    const fileOccurrences = findOccurrencesInFile(file, regex)
    fileOccurrences.forEach(({ key, defaultValue }) => {
      if (result[key] && result[key] !== defaultValue)
        console.warn(`Duplicate key found in ${file}: ${key}`)
      result[key] = defaultValue
    })
  })
  fs.writeFileSync(
    `${directoryOutput}/${defaultLocale}.json`,
    JSON.stringify(result, null, 2) + '\n',
  )
}

const defaultLocale =
  process.argv
    .find((a: string) => a.startsWith('--default-lang='))
    ?.split('=')[1] ?? 'en'
const directoryPath = `${process.cwd()}/src`
const directoryOutputPath = `${process.cwd()}/static/lang`

findTranslations(defaultLocale, directoryPath, directoryOutputPath)
