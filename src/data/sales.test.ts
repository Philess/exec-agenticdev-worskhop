import { describe, expect, it } from 'vitest'
import { createDemoAlbums } from './albums'
import { createDemoSales, DEMO_END_DATE, DEMO_START_DATE } from './sales'

const data = createDemoSales()
const days = (start: string, end: string) => (Date.parse(end) - Date.parse(start)) / 86400000 + 1

describe('two-year sales dataset', () => {
  it('covers two complete calendar years with ten physical stores and one online shop', () => {
    expect(data.metadata).toMatchObject({
      schemaVersion: 1, fictional: true, currency: 'USD', timezone: 'UTC',
      startDate: '2024-01-01', endDate: '2025-12-31'
    })
    expect(data.locations.filter(location => location.channel === 'store')).toHaveLength(10)
    expect(data.locations.filter(location => location.channel === 'online')).toHaveLength(1)
    expect(data.customers).toHaveLength(600)
    expect(data.albums).toHaveLength(30)
    expect(data.events).toHaveLength(10)
    for (const entities of [data.customers, data.locations, data.albums, data.orders, data.events]) {
      expect(new Set(entities.map(entity => entity.id)).size).toBe(entities.length)
    }
    const dates = [...new Set(data.orders.map(order => order.date))].sort()
    expect(dates).toHaveLength(731)
    expect(dates[0]).toBe(DEMO_START_DATE)
    expect(dates.at(-1)).toBe(DEMO_END_DATE)
    expect(dates).toContain('2024-02-29')
    for (const year of ['2024', '2025']) {
      for (let month = 1; month <= 12; month++) {
        const prefix = `${year}-${String(month).padStart(2, '0')}`
        const soldAt = new Set(data.orders.filter(order => order.date.startsWith(prefix)).map(order => order.locationId))
        expect(soldAt.size).toBe(11)
      }
    }
  })

  it('keeps most albums on sale from the start and introduces eight later launches', () => {
    expect(data.albums.filter(album => album.saleStartDate <= DEMO_START_DATE)).toHaveLength(22)
    const launches = data.albums.filter(album => album.saleStartDate > DEMO_START_DATE)
    expect(launches).toHaveLength(8)
    for (const year of ['2024', '2025']) {
      expect(launches.filter(album => album.saleStartDate.startsWith(year))).toHaveLength(4)
    }
    for (const album of data.albums) {
      expect(album.releaseDate <= album.saleStartDate).toBe(true)
      const purchases = data.orders.filter(order => order.lines.some(line => line.product.id === album.id))
      expect(purchases.length).toBeGreaterThan(0)
      expect(purchases.every(order => order.date >= album.saleStartDate)).toBe(true)
      expect(album.image_url).toBe('/album-cover.svg')
    }
    for (const album of createDemoAlbums()) {
      const historical = data.albums.find(item => item.id === album.id)
      expect(historical).toMatchObject({ id: album.id, title: album.title, artist: album.artist, price: album.price })
    }
  })

  it('has valid customer, store, product and event joins and integer monetary amounts', () => {
    const customers = new Map(data.customers.map(customer => [customer.id, customer]))
    const locations = new Map(data.locations.map(location => [location.id, location]))
    const albums = new Map(data.albums.map(album => [album.id, album]))
    for (const customer of data.customers) {
      const home = locations.get(customer.homeStoreId)
      expect(home).toMatchObject({ channel: 'store', region: customer.region })
      expect(customer.joinedOn <= DEMO_END_DATE).toBe(true)
    }
    for (const order of data.orders) {
      expect(order.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(new Date(order.date).toISOString().slice(0, 10)).toBe(order.date)
      const customer = customers.get(order.customerId)
      const location = locations.get(order.locationId)
      expect(customer).toBeDefined()
      expect(location).toBeDefined()
      expect(customer!.joinedOn <= order.date).toBe(true)
      expect(location!.openedOn <= order.date).toBe(true)
      expect(order.lines.length).toBeGreaterThan(0)
      expect(new Set(order.lines.map(line => line.product.id)).size).toBe(order.lines.length)
      expect(order.eventIds).toEqual(data.events
        .filter(event => event.startDate <= order.date && event.endDate >= order.date)
        .map(event => event.id))
      for (const line of order.lines) {
        const album = albums.get(line.product.id)
        expect(album).toMatchObject(line.product)
        expect(Number.isSafeInteger(line.quantity)).toBe(true)
        expect(line.quantity).toBeGreaterThan(0)
        expect(Number.isSafeInteger(line.unitPriceCents)).toBe(true)
        expect(line.unitPriceCents).toBe(Math.round(album!.price * 100))
      }
    }
    expect(data.orders.some(order => order.lines.length > 1)).toBe(true)
    const purchaseCounts = new Map<string, number>()
    for (const order of data.orders) {
      purchaseCounts.set(order.customerId, (purchaseCounts.get(order.customerId) ?? 0) + 1)
    }
    expect([...purchaseCounts.values()].some(count => count > 1)).toBe(true)
  })

  it.each([
    ['christmas', 6],
    ['love', 5],
    ['summer', 2],
    ['halloween', 4],
    ['study', 2.5]
  ] as const)('has measurable %s peaks in both years and both channels', (tag, minimumLift) => {
    // Use established single-theme albums so launches and overlapping themes do not bias the comparison.
    const albumIds = new Set(data.albums.filter(album =>
      album.saleStartDate < DEMO_START_DATE && album.tags.length === 1 && album.tags[0] === tag
    ).map(album => album.id))
    for (const year of ['2024', '2025']) {
      const event = data.events.find(event => event.albumTag === tag && event.startDate.startsWith(year))!
      const peakDays = days(event.startDate, event.endDate)
      const offDays = days(`${year}-01-01`, `${year}-12-31`) - peakDays
      for (const channel of ['online', 'store']) {
        const locationIds = new Set(data.locations.filter(location => location.channel === channel).map(location => location.id))
        let peakUnits = 0
        let offUnits = 0
        for (const order of data.orders) {
          if (!order.date.startsWith(year) || !locationIds.has(order.locationId)) continue
          const units = order.lines.filter(line => albumIds.has(line.product.id)).reduce((sum, line) => sum + line.quantity, 0)
          if (order.date >= event.startDate && order.date <= event.endDate) peakUnits += units
          else offUnits += units
        }
        expect(offUnits).toBeGreaterThan(0)
        expect((peakUnits / peakDays) / (offUnits / offDays), `${tag}, ${year}, ${channel}`).toBeGreaterThan(minimumLift)
      }
    }
  })

  it('bounds Christmas and Valentine events to the requested calendar windows', () => {
    for (const year of ['2024', '2025']) {
      expect(data.events.find(event => event.id === `christmas-${year}`)).toMatchObject({
        startDate: `${year}-11-01`, endDate: `${year}-12-31`
      })
      expect(data.events.find(event => event.id === `valentine-${year}`)).toMatchObject({
        startDate: `${year}-02-01`, endDate: `${year}-02-14`
      })
    }
  })

  it('returns independent copies without mutating the bundled fixture', () => {
    const copy = createDemoSales()
    copy.albums[0].title = 'Edited'
    copy.albums[0].tags.push('edited')
    copy.orders[0].lines[0].quantity = 999
    copy.orders[0].eventIds.push('edited')
    copy.customers[0].region = 'Edited'
    copy.locations[0].name = 'Edited'
    expect(createDemoSales()).toEqual(data)
  })
})
