import { createDemoAlbums } from '../data/albums'
import type { Album } from '../types/album'

export const ALBUM_STORAGE_KEY = 'exec-agenticdev-workshop.albums.v1'

type AlbumStorage = Pick<Storage, 'getItem' | 'setItem'>

const isAlbum = (value: unknown): value is Album => {
  if (typeof value !== 'object' || value === null) return false
  return 'id' in value && typeof value.id === 'number' && Number.isSafeInteger(value.id) && value.id > 0
    && 'title' in value && typeof value.title === 'string' && value.title.trim().length > 0
    && 'artist' in value && typeof value.artist === 'string' && value.artist.trim().length > 0
    && 'price' in value && typeof value.price === 'number' && Number.isFinite(value.price) && value.price >= 0
    && 'image_url' in value && typeof value.image_url === 'string' && value.image_url.trim().length > 0
}

const isAlbumCollection = (value: unknown): value is Album[] =>
  Array.isArray(value) && value.every(isAlbum) && new Set(value.map(album => album.id)).size === value.length

export const saveAlbums = (albums: Album[], storage: AlbumStorage = window.localStorage): void => {
  if (!isAlbumCollection(albums)) throw new Error('Invalid album collection')
  storage.setItem(ALBUM_STORAGE_KEY, JSON.stringify({ version: 1, albums }))
}

export const resetAlbums = (storage: AlbumStorage = window.localStorage): Album[] => {
  const albums = createDemoAlbums()
  saveAlbums(albums, storage)
  return albums
}

export const loadAlbums = (storage: AlbumStorage = window.localStorage): Album[] => {
  const saved = storage.getItem(ALBUM_STORAGE_KEY)
  if (saved === null) return resetAlbums(storage)

  let data: unknown
  try {
    data = JSON.parse(saved)
  } catch {
    throw new Error('Saved album data is not valid JSON')
  }

  if (typeof data !== 'object' || data === null || !('version' in data) || data.version !== 1
    || !('albums' in data) || !isAlbumCollection(data.albums)) {
    throw new Error('Saved album data has an unsupported format')
  }

  return data.albums
}
