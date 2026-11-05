import { dispatch, TdiEvents, unknownEventName } from '../events'
import { applyInsert, buildInsertDetail } from '../instructions/insert'
import { applyPopup, buildPopupDetail } from '../instructions/popup'
import { applyRedirect, buildRedirectDetail } from '../instructions/redirect'
import { InstructionRegistry, runInstruction, unknownDetail } from '../instructions/registry'
import { applyReload, buildReloadDetail } from '../instructions/reload'
import { applyScript, buildScriptDetail } from '../instructions/script'
import { applyStyle, buildStyleDetail } from '../instructions/style'
import { applyUpdate, buildUpdateDetail } from '../instructions/update'
import type { ParsedResponse } from '../net/parse'
import type { ContentScriptPolicy, TdiRequestOptions, TdiResponses } from '../types'

export interface DefaultRegistryOptions {
  nonce?: string
  policy?: ContentScriptPolicy
}

// Built-ins go through the same register() as registerInstruction: no privileged path
export function createDefaultRegistry(opts: DefaultRegistryOptions = {}): InstructionRegistry {
  const { nonce, policy } = opts
  const registry = new InstructionRegistry()
  registry.register('update', (d) => applyUpdate(d, { nonce, policy }))
  registry.register('insert', (d) => applyInsert(d, { nonce, policy }))
  registry.register('script', (d) => applyScript(d, { nonce }))
  registry.register('style', (d) => applyStyle(d, { nonce }))
  registry.register('popup', applyPopup)
  registry.register('reload', applyReload)
  registry.register('redirect', applyRedirect)
  return registry
}

type Builder = (tag: Element, options: TdiRequestOptions) => any

// Detail builders for the built-ins, whoever ends up handling them; anything else is unknown
const builders: Record<string, Builder> = {
  update: buildUpdateDetail,
  insert: buildInsertDetail,
  script: buildScriptDetail,
  style: buildStyleDetail,
  popup: buildPopupDetail,
  reload: buildReloadDetail,
  redirect: buildRedirectDetail,
}

const beforeEvents: Record<string, string> = {
  update: TdiEvents.beforeUpdate,
  insert: TdiEvents.beforeInsert,
  script: TdiEvents.beforeScript,
  style: TdiEvents.beforeStyle,
  popup: TdiEvents.beforePopup,
  reload: TdiEvents.beforeReload,
  redirect: TdiEvents.beforeRedirect,
}

const collectionKeys: Record<string, keyof TdiResponses> = {
  update: 'updates',
  insert: 'inserts',
  script: 'scripts',
  style: 'styles',
  popup: 'popups',
}

// All state is local to the call, so nothing can accumulate across requests
export async function applyResponse(
  parsed: ParsedResponse,
  options: TdiRequestOptions,
  registry: InstructionRegistry,
  involved: Element[],
): Promise<TdiResponses> {
  const responses: TdiResponses = { updates: [], inserts: [], scripts: [], styles: [], popups: [], unknowns: [] }
  const scripts: Array<() => Promise<void>> = []

  // Isolates one instruction: errors are reported, never rethrown
  const isolate = async (name: string, work: () => Promise<void> | void): Promise<void> => {
    try {
      await work()
    } catch (err) {
      console.error(`TDI: <${name}> instruction failed`, err)
    }
  }

  for (const tag of parsed.instructions) {
    const name = tag.tagName.toLowerCase()
    await isolate(name, async () => {
      const detail = (builders[name] ?? unknownDetail)(tag, options)
      if (!detail) return // target missing or no href: skipped silently

      const key = collectionKeys[name]
      if (key) (responses[key] as unknown[]).push(detail)
      else if (!(name in builders)) responses.unknowns.push(detail)

      const before = beforeEvents[name] ?? unknownEventName(name)
      // update/insert events go to the first target; the rest to document
      const target: EventTarget = name === 'update' || name === 'insert' ? detail.target[0] : document
      if (name === 'script') {
        scripts.push(() => isolate(name, () => runInstruction(registry, name, detail, target, before)))
        return
      }
      await runInstruction(registry, name, detail, target, before)
    })
  }

  // Involved elements may have been replaced by an instruction; fall back to document (v1 issue #6)
  const live = involved.filter((el) => el.isConnected)
  const targets: EventTarget[] = live.length ? live : [document]
  const fire = (name: string, detail: object): void => {
    for (const t of targets) dispatch(t, name, { ...detail, options })
  }
  fire(TdiEvents.updatesDone, { updates: responses.updates })
  fire(TdiEvents.insertsDone, { inserts: responses.inserts })
  fire(TdiEvents.stylesDone, { styles: responses.styles })
  fire(TdiEvents.popupsDone, { popups: responses.popups })
  fire(TdiEvents.unknownsDone, { unknowns: responses.unknowns })
  // v1 order: the five non-script Done events fire before the script chain starts
  for (const run of scripts) await run()
  fire(TdiEvents.scriptsDone, { scripts: responses.scripts })
  fire(TdiEvents.done, { responses })

  return responses
}
