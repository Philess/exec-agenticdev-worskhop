import type { Album } from './album'

export type SalesChannel = 'online' | 'store'

export interface SalesLocation {
  id: string
  name: string
  channel: SalesChannel
}

export interface Customer {
  id: string
  region: string
}

export interface OrderLine {
  product: Pick<Album, 'id' | 'title' | 'artist'>
  quantity: number
  unitPriceCents: number
}

export interface SalesOrder {
  id: string
  date: string
  customerId: string
  locationId: string
  lines: OrderLine[]
}

export interface SalesData {
  locations: SalesLocation[]
  customers: Customer[]
  orders: SalesOrder[]
}

export interface SalesDataset extends SalesData {
  metadata: {
    schemaVersion: number
    fictional: boolean
    seed: number
    startDate: string
    endDate: string
    currency: string
    timezone: string
    description: string
    model: {
      seasonalDemand: string
      launchWindowDays: number
      launchDemandMultiplier: number
      weekendDemandMultiplier: number
      secondYearDemandMultiplier: number
      onlineOrderProbabilityByYear: Record<string, number>
      limitations: string
    }
  }
  albums: (Album & {
    genre: string
    tags: string[]
    releaseDate: string
    saleStartDate: string
  })[]
  locations: (SalesLocation & { region: string; openedOn: string })[]
  customers: (Customer & {
    homeStoreId: string
    joinedOn: string
    preferredGenre: string
    preferredChannel: SalesChannel
  })[]
  events: {
    id: string
    name: string
    startDate: string
    endDate: string
    albumTag: string
    demandMultiplier: number
  }[]
  orders: (SalesOrder & { eventIds: string[] })[]
}
