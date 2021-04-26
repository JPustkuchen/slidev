import { promises as fs, existsSync } from 'fs'
import { join, posix } from 'path'
import { ResolvedSlidevOptions } from './plugins/options'

export async function getIndexHtml({ clientRoot, themeRoots, userRoot }: ResolvedSlidevOptions): Promise<string> {
  let main = await fs.readFile(join(clientRoot, 'index.html'), 'utf-8')
  let head = ''
  let body = ''

  const roots = [
    ...themeRoots,
    userRoot,
  ]

  for (const root of roots) {
    const path = join(root, 'index.html')
    if (!existsSync(path))
      continue

    const index = await fs.readFile(path, 'utf-8')

    head += `\n${(index.match(/<head>([\s\S]*?)<\/head>/im)?.[1] || '').trim()}`
    body += `\n${(index.match(/<body>([\s\S]*?)<\/body>/im)?.[1] || '').trim()}`
  }

  main = main
    .replace('__ENTRY__', `/@fs${posix.join(clientRoot, 'main.ts')}`)
    .replace('<!-- head -->', head)
    .replace('<!-- body -->', body)

  return main
}
