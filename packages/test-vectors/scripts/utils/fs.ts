import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CAR } from 'cartonne'

export async function writeCARFile(
  controllerType: string,
  car: CAR,
): Promise<string> {
  const filePath = fileURLToPath(
    new URL(`../../assets/${controllerType}.car`, import.meta.url),
  )
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, car.bytes)
  return filePath
}
