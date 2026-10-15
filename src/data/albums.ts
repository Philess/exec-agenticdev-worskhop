import type { Album } from '../types/album'

export const createDemoAlbums = (): Album[] => [
  { id: 1, title: 'Midnight Signals', artist: 'The Northern Lights', price: 12.99, image_url: `${import.meta.env.BASE_URL}album-cover.svg` },
  { id: 2, title: 'City in Motion', artist: 'Paper Satellites', price: 10.99, image_url: `${import.meta.env.BASE_URL}album-cover.svg` },
  { id: 3, title: 'Quiet Horizons', artist: 'Mira & the Echoes', price: 14.49, image_url: `${import.meta.env.BASE_URL}album-cover.svg` },
  { id: 4, title: 'Electric Gardens', artist: 'Velvet Circuit', price: 11.99, image_url: `${import.meta.env.BASE_URL}album-cover.svg` },
  { id: 5, title: 'Sunday Sketches', artist: 'The Amber Trio', price: 9.99, image_url: `${import.meta.env.BASE_URL}album-cover.svg` },
  { id: 6, title: 'Open Roads', artist: 'Westbound Stories', price: 13.99, image_url: `${import.meta.env.BASE_URL}album-cover.svg` }
]
