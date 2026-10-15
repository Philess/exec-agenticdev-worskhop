import { beforeEach, describe, expect, it } from 'vitest'
import { createDemoAlbums } from '../data/albums'
import { ALBUM_STORAGE_KEY, loadAlbums, resetAlbums, saveAlbums } from './albumStorage'

describe('album storage', () => {
  let values: Map<string, string>
  let storage: Pick<Storage, 'getItem' | 'setItem'>

  beforeEach(() => {
    values = new Map()
    storage = {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => { values.set(key, value) }
    }
  })

  it('seeds and persists the collection on first use', () => {
    expect(loadAlbums(storage)).toEqual(createDemoAlbums())
    expect(JSON.parse(values.get(ALBUM_STORAGE_KEY)!)).toEqual({ version: 1, albums: createDemoAlbums() })
  })

  it('preserves saved changes on subsequent loads', () => {
    const albums = createDemoAlbums().slice(0, 1)
    albums[0].title = 'Workshop edit'
    saveAlbums(albums, storage)
    expect(loadAlbums(storage)).toEqual(albums)
    expect(loadAlbums(storage)).toEqual(albums)
  })

  it('does not reseed an intentionally empty collection', () => {
    saveAlbums([], storage)
    expect(loadAlbums(storage)).toEqual([])
  })

  it('resets only the collection key and creates fresh seed objects', () => {
    values.set('unrelated', 'keep')
    saveAlbums([], storage)
    const albums = resetAlbums(storage)
    albums[0].title = 'Unsaved edit'
    expect(loadAlbums(storage)).toEqual(createDemoAlbums())
    expect(values.get('unrelated')).toBe('keep')
  })

  it.each([
    '',
    '{invalid',
    'null',
    '[]',
    '{"version":2,"albums":[]}',
    '{"version":1,"albums":[{"id":1}]}',
    JSON.stringify({ version: 1, albums: [{ ...createDemoAlbums()[0], price: -1 }] }),
    JSON.stringify({ version: 1, albums: [{ ...createDemoAlbums()[0], price: '12.99' }] }),
    JSON.stringify({ version: 1, albums: [{ ...createDemoAlbums()[0], title: '' }] }),
    JSON.stringify({ version: 1, albums: [createDemoAlbums()[0], createDemoAlbums()[0]] })
  ])('rejects invalid stored data without overwriting it: %s', saved => {
    values.set(ALBUM_STORAGE_KEY, saved)
    expect(() => loadAlbums(storage)).toThrow()
    expect(values.get(ALBUM_STORAGE_KEY)).toBe(saved)
  })

  it('rejects invalid writes without replacing saved data', () => {
    const albums = loadAlbums(storage)
    const saved = values.get(ALBUM_STORAGE_KEY)
    albums[0].price = NaN
    expect(() => saveAlbums(albums, storage)).toThrow('Invalid album collection')
    expect(values.get(ALBUM_STORAGE_KEY)).toBe(saved)
  })

  it('propagates storage read and write failures', () => {
    const unavailable = {
      getItem: (): never => { throw new Error('Storage blocked') },
      setItem: (): never => { throw new Error('Storage full') }
    }
    expect(() => loadAlbums(unavailable)).toThrow('Storage blocked')
    expect(() => saveAlbums([], unavailable)).toThrow('Storage full')
    expect(() => resetAlbums(unavailable)).toThrow('Storage full')
  })
})
