import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CAR } from 'cartonne'

export async function createControllerDir(
  controllerType: string,
  meta: Record<string, unknown>,
): Promise<string> {
  const dirPath = fileURLToPath(
    new URL(`../../assets/${controllerType}`, import.meta.url),
  )
  await mkdir(dirPath, { recursive: true })
  await writeFile(join(dirPath, 'meta.json'), JSON.stringify(meta, null, 2))
  return dirPath
}

export async function writeCARFile(
  pathParts: Array<string>,
  car: CAR,
): Promise<string> {
  const filePath = join(...pathParts)
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(`${filePath}.car`, car.bytes)
  return filePath
}
