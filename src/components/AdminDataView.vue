<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { createDemoSales } from '../data/sales'
import type { SalesDataset } from '../types/sales'

const data = createDemoSales()
const collections: { key: keyof SalesDataset; label: string }[] = [
  { key: 'metadata', label: 'Metadata' },
  { key: 'albums', label: 'Albums' },
  { key: 'locations', label: 'Stores and online shop' },
  { key: 'customers', label: 'Customers' },
  { key: 'events', label: 'Seasonal events' },
  { key: 'orders', label: 'Orders' }
]
const selected = ref<keyof SalesDataset>('metadata')
const page = ref(1)
const pageSize = 25
const collection = computed(() => data[selected.value])
const recordCount = computed(() => Array.isArray(collection.value) ? collection.value.length : 1)
const pageCount = computed(() => Math.max(1, Math.ceil(recordCount.value / pageSize)))
const firstRecord = computed(() => (page.value - 1) * pageSize + 1)
const lastRecord = computed(() => Math.min(page.value * pageSize, recordCount.value))
const rawJson = computed(() => JSON.stringify(
  Array.isArray(collection.value)
    ? collection.value.slice((page.value - 1) * pageSize, page.value * pageSize)
    : collection.value,
  null,
  2
))
watch(selected, () => { page.value = 1 })
</script>

<template>
  <main class="admin-data">
    <header class="admin-header">
      <h1>Workshop data</h1>
      <p>This is the starting point for your seller dashboard. Inspect the fictional raw data below, then build your own management views.</p>
    </header>

    <section class="data-panel" aria-label="Raw dataset">
      <p class="admin-notice"><strong>Simulated admin mode.</strong> No credentials or real authentication. Logout returns to the shop; refreshing also logs you out.</p>
      <p>Source: <code>src/data/sales.json</code> &middot; {{ data.metadata.startDate }} to {{ data.metadata.endDate }} &middot; {{ data.metadata.currency }}.
        This read-only dataset is separate from the shop's saved albums.</p>

      <label for="data-collection">Data collection</label>
      <select id="data-collection" v-model="selected">
        <option v-for="item in collections" :key="item.key" :value="item.key">{{ item.label }}</option>
      </select>

      <div class="pagination">
        <p role="status">{{ selected }}: {{ recordCount }} records. Showing {{ firstRecord }}&ndash;{{ lastRecord }}. Page {{ page }} of {{ pageCount }}.</p>
        <button :disabled="page === 1" @click="page--">Previous</button>
        <button :disabled="page === pageCount" @click="page++">Next</button>
      </div>
      <pre tabindex="0" role="region" :aria-label="`Raw ${selected} JSON`"><code>{{ rawJson }}</code></pre>
    </section>
  </main>
</template>

<style scoped>
.admin-data {
  min-height: calc(100vh - 72px);
  box-sizing: border-box;
  padding: 2rem;
  line-height: 1.6;
}

.admin-header {
  max-width: 800px;
  margin: 0 auto 3rem;
  text-align: center;
  color: white;
}
.admin-header h1 {
  font-size: 3rem;
  margin: 0.67em 0 0.5rem;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
.admin-header p { font-size: 1.2rem; opacity: 0.9; }
.data-panel {
  max-width: 1200px;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
.admin-notice { margin-top: 0; }
label { display: block; font-weight: bold; margin-top: 1.5rem; }
select, button { font: inherit; padding: 0.75rem; border-radius: 8px; }
select { max-width: 100%; border: 1px solid #764ba2; background: white; color: #333; }
button { border: none; background: #764ba2; color: white; font-weight: 600; }
button:hover:not(:disabled) { background: #603c85; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.pagination { display: flex; align-items: center; flex-wrap: wrap; gap: .75rem; margin: 1rem 0; }
.pagination p { flex: 1 1 20rem; margin: 0; }
button:not(:disabled), select { cursor: pointer; }
pre {
  max-height: 65vh;
  overflow: auto;
  border: 1px solid #d8d5eb;
  border-radius: 8px;
  background: white;
  padding: 1rem;
  margin-bottom: 0;
  font-size: .85rem;
  tab-size: 2;
}
code { font-family: Consolas, 'Courier New', monospace; overflow-wrap: anywhere; }
:focus-visible { outline: 3px solid #764ba2; outline-offset: 3px; }

@media (max-width: 768px) {
  .admin-data, .data-panel { padding: 1rem; }
  .admin-header h1 { font-size: 2rem; }
}
</style>
