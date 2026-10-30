import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const target = fileURLToPath(new URL('../src/data/sales.json', import.meta.url))
const seed = 20240101
let state = seed
const random = () => {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0
  return state / 4294967296
}
const pick = values => values[Math.floor(random() * values.length)]
const weightedPick = (values, weight) => {
  let remaining = random() * values.reduce((sum, value) => sum + weight(value), 0)
  for (const value of values) {
    remaining -= weight(value)
    if (remaining < 0) return value
  }
  return values.at(-1)
}
const poisson = mean => {
  const limit = Math.exp(-mean)
  let product = 1
  let count = 0
  do {
    product *= random()
    count++
  } while (product > limit)
  return count - 1
}
const dayMs = 86400000
const dateAt = time => new Date(time).toISOString().slice(0, 10)
const startDate = '2024-01-01'
const endDate = '2025-12-31'
const startTime = Date.parse(startDate)
const endTime = Date.parse(endDate)

const cities = [
  'Alder Bay', 'Maple Crossing', 'Fern Hollow', 'Cedar Vale', 'Willow Ridge',
  'Juniper Cove', 'Birch Haven', 'Hazel Grove', 'Elm Reach', 'Silverbrook'
]
const shopNames = [
  'Northside Records', 'Harbor Listening Room', 'Garden Quarter', 'Cedar Vinyl',
  'Ridge Records', 'Cove Music', 'Birch Record House', 'Hazel Listening Lounge',
  'Elm Street Sounds', 'Silverbrook Records'
]
const locations = [
  { id: 'online', name: 'Online shop', channel: 'online', region: 'All regions', openedOn: '2020-01-01' },
  ...cities.map((region, index) => ({
    id: `store-${String(index + 1).padStart(2, '0')}`,
    name: shopNames[index],
    channel: 'store',
    region,
    openedOn: '2020-01-01'
  }))
]

// Release and on-sale dates are separate: no preorders are generated.
const catalog = [
  ['Midnight Signals', 'The Northern Lights', 1299, 'Synth pop', [], '2021-09-17', '2021-09-17'],
  ['City in Motion', 'Paper Satellites', 1099, 'Indie pop', ['summer'], '2022-05-20', '2022-05-20'],
  ['Quiet Horizons', 'Mira & the Echoes', 1449, 'Ambient', ['study'], '2020-08-14', '2020-08-14'],
  ['Electric Gardens', 'Velvet Circuit', 1199, 'Electronic', ['summer'], '2022-06-03', '2022-06-03'],
  ['Sunday Sketches', 'The Amber Trio', 999, 'Jazz', [], '2019-03-22', '2019-03-22'],
  ['Open Roads', 'Westbound Stories', 1399, 'Folk', ['summer'], '2023-04-07', '2023-04-07'],
  ['Everything I Wish for Christmas', 'Holly Lanterns', 1299, 'Holiday pop', ['christmas'], '2019-11-01', '2019-11-01'],
  ['Snowfall on the Turntable', 'The Winter Postcards', 1499, 'Jazz', ['christmas'], '2021-10-22', '2021-10-22'],
  ['December Together', 'Scarlet Mittens', 1199, 'Holiday pop', ['christmas', 'love'], '2022-11-04', '2022-11-04'],
  ['Letters for Two', 'Rosewater Avenue', 1299, 'Soul', ['love'], '2020-01-24', '2020-01-24'],
  ['Heartbeats in Stereo', 'The Velvet Notes', 1399, 'Indie pop', ['love'], '2021-02-05', '2021-02-05'],
  ['Slow Dance at Dusk', 'June & the Fireflies', 1099, 'Jazz', ['love'], '2023-01-20', '2023-01-20'],
  ['Saltwater Speakers', 'Coral Weekend', 1299, 'Indie pop', ['summer'], '2021-05-14', '2021-05-14'],
  ['Sunlit Highways', 'Golden Mile Club', 1199, 'Rock', ['summer'], '2022-06-10', '2022-06-10'],
  ['Lanterns After Midnight', 'The Hollow Pines', 1499, 'Rock', ['halloween'], '2020-09-25', '2020-09-25'],
  ['Ghosts on Magnetic Tape', 'Phantom Frequency', 1399, 'Electronic', ['halloween'], '2022-10-07', '2022-10-07'],
  ['Library Windows', 'Soft Pencil', 999, 'Ambient', ['study'], '2021-08-20', '2021-08-20'],
  ['Notes in the Margins', 'The Quiet Desks', 1099, 'Jazz', ['study'], '2023-08-11', '2023-08-11'],
  ['Copper Skyline', 'Fable Engines', 1599, 'Rock', [], '2020-07-17', '2020-07-17'],
  ['Small Town Constellations', 'Wren Orchard', 1299, 'Folk', [], '2022-03-18', '2022-03-18'],
  ['Blue Hour Sessions', 'The Indigo Steps', 1499, 'Soul', [], '2021-04-09', '2021-04-09'],
  ['Parallel Streets', 'Metro Lantern', 1199, 'Electronic', [], '2023-09-08', '2023-09-08'],
  ['A Postcard Called Love', 'Rosewater Avenue', 1499, 'Soul', ['love'], '2024-01-19', '2024-01-26'],
  ['Tides and Turntables', 'Coral Weekend', 1399, 'Indie pop', ['summer'], '2024-05-17', '2024-05-17'],
  ['The Lantern House', 'The Hollow Pines', 1599, 'Rock', ['halloween'], '2024-09-13', '2024-09-20'],
  ['A New December', 'Holly Lanterns', 1499, 'Holiday pop', ['christmas'], '2024-11-08', '2024-11-08'],
  ['Velvet Valentines', 'The Velvet Notes', 1499, 'Indie pop', ['love'], '2025-01-24', '2025-01-24'],
  ['Tomorrow in Color', 'Paper Satellites', 1399, 'Indie pop', ['summer'], '2025-04-18', '2025-04-25'],
  ['After Class', 'Soft Pencil', 1199, 'Ambient', ['study'], '2025-08-15', '2025-08-15'],
  ['Winter on Repeat', 'The Winter Postcards', 1599, 'Jazz', ['christmas'], '2025-10-24', '2025-10-31']
]
const albums = catalog.map(([title, artist, cents, genre, tags, releaseDate, saleStartDate], index) => ({
  id: index + 1, title, artist, price: cents / 100, image_url: '/album-cover.svg',
  genre, tags, releaseDate, saleStartDate
}))
const genres = [...new Set(albums.map(album => album.genre))]
const customers = Array.from({ length: 600 }, (_, index) => {
  const homeStore = locations[1 + index % 10]
  return {
    id: `Listener ${String(index + 1).padStart(3, '0')}`,
    region: homeStore.region,
    homeStoreId: homeStore.id,
    joinedOn: index < 450
      ? dateAt(startTime - (30 + Math.floor(random() * 1000)) * dayMs)
      : dateAt(startTime + Math.floor(random() * 680) * dayMs),
    preferredGenre: pick(genres),
    preferredChannel: random() < 0.45 ? 'online' : 'store'
  }
})
const events = [2024, 2025].flatMap(year => [
  { id: `valentine-${year}`, name: "Valentine's gifting", startDate: `${year}-02-01`, endDate: `${year}-02-14`, albumTag: 'love', demandMultiplier: 12 },
  { id: `summer-${year}`, name: 'Summer listening', startDate: `${year}-06-01`, endDate: `${year}-08-31`, albumTag: 'summer', demandMultiplier: 3.5 },
  { id: `study-${year}`, name: 'Back to school', startDate: `${year}-08-15`, endDate: `${year}-09-30`, albumTag: 'study', demandMultiplier: 5 },
  { id: `halloween-${year}`, name: 'Halloween listening', startDate: `${year}-10-01`, endDate: `${year}-10-31`, albumTag: 'halloween', demandMultiplier: 9 },
  { id: `christmas-${year}`, name: 'Christmas listening and gifting', startDate: `${year}-11-01`, endDate: `${year}-12-31`, albumTag: 'christmas', demandMultiplier: 16 }
])
const orders = []
for (let time = startTime; time <= endTime; time += dayMs) {
  const date = dateAt(time)
  const day = new Date(time).getUTCDay()
  const weekend = day === 0 || day === 6
  const yearTwo = date.startsWith('2025')
  const activeEvents = events.filter(event => date >= event.startDate && date <= event.endDate)
  const availableAlbums = albums.filter(album => album.saleStartDate <= date)
  const eligibleCustomers = customers.filter(customer => customer.joinedOn <= date)
  const demand = album => {
    const season = Math.max(1, ...activeEvents.filter(event => album.tags.includes(event.albumTag)).map(event => event.demandMultiplier))
    const ageDays = (time - Date.parse(album.saleStartDate)) / dayMs
    const launch = ageDays < 28 ? 2.5 : 1
    // Seasonal titles retain a low off-season baseline, not an artificial zero.
    const baseline = album.tags.length ? 0.18 : 0.55
    return baseline * (0.8 + (album.id % 5) * 0.12) * season * launch
  }
  for (const album of availableAlbums) {
    const transactions = poisson(demand(album) * (weekend ? 1.3 : 1) * (yearTwo ? 1.12 : 1))
    for (let index = 0; index < transactions; index++) {
      const channel = random() < (yearTwo ? 0.46 : 0.40) ? 'online' : 'store'
      const customer = weightedPick(eligibleCustomers, customer =>
        (customer.preferredGenre === album.genre ? 3 : 1) *
        (customer.preferredChannel === channel ? 3 : 1)
      )
      const location = channel === 'online' ? locations[0]
        : weightedPick(locations.slice(1), location => location.id === customer.homeStoreId ? 14 : 1)
      const basket = [album]
      if (random() < 0.23) {
        basket.push(weightedPick(availableAlbums.filter(other => other.id !== album.id), demand))
      }
      orders.push({
        id: `SALE-${String(orders.length + 1).padStart(6, '0')}`,
        date,
        customerId: customer.id,
        locationId: location.id,
        eventIds: activeEvents.map(event => event.id),
        lines: basket.map(item => ({
          product: { id: item.id, title: item.title, artist: item.artist },
          quantity: random() < 0.09 ? 2 : 1,
          unitPriceCents: Math.round(item.price * 100)
        }))
      })
    }
  }
}
const dataset = {
  metadata: {
    schemaVersion: 1,
    fictional: true,
    seed,
    startDate,
    endDate,
    currency: 'USD',
    timezone: 'UTC',
    description: 'Synthetic completed album sales; all customers, artists, albums and places are fictional.',
    model: {
      seasonalDemand: 'Event multipliers affect matching album tags; overlapping matches use the largest multiplier.',
      launchWindowDays: 28,
      launchDemandMultiplier: 2.5,
      weekendDemandMultiplier: 1.3,
      secondYearDemandMultiplier: 1.12,
      onlineOrderProbabilityByYear: { 2024: 0.40, 2025: 0.46 },
      limitations: 'Designed correlations, not real-world evidence. No tax, shipping, discounts, returns, stockouts or preorders. Event IDs describe the calendar, not proven purchase motivation.'
    }
  },
  locations,
  customers,
  albums,
  events,
  orders
}
// One order per line keeps the detailed, checked-in fixture reasonably small.
const { orders: rows, ...dimensions } = dataset
const json = `${JSON.stringify(dimensions, null, 2).slice(0, -2)},\n  "orders": [\n${rows.map(order => `    ${JSON.stringify(order)}`).join(',\n')}\n  ]\n}\n`
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8').replace(/\r\n/g, '\n') !== json) {
    throw new Error('Sales fixture is out of date. Run bun run data:generate.')
  }
} else {
  writeFileSync(target, json)
}
console.log(`${orders.length} orders, ${customers.length} customers, ${albums.length} albums; ${startDate} through ${endDate}.`)
