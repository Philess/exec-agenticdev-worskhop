<template>
  <nav class="app-navigation" aria-label="Main navigation">
    <span class="app-brand">ALBUM COLLECTION</span>
    <button @click="isAdmin = !isAdmin">{{ isAdmin ? 'Logout' : 'Admin login' }}</button>
  </nav>
  <AdminDataView v-if="isAdmin" />
  <div v-else class="app">
    <header class="header">
      <h1>🎵 Album Collection</h1>
      <p>Discover amazing music albums</p>
      <p class="storage-note">Demo data is saved in this browser. No backend required.</p>
      <button @click="resetDemoData" class="retry-btn">Reset demo data</button>
    </header>

    <main class="main">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading albums...</p>
      </div>

      <div v-else-if="error" class="error" role="alert">
        <p>{{ error }}</p>
        <button @click="fetchAlbums" class="retry-btn">Try again</button>
      </div>

      <p v-else-if="albums.length === 0" class="empty">Your album collection is empty. Reset demo data to restore the sample albums.</p>

      <div v-else class="albums-grid">
        <AlbumCard 
          v-for="album in albums" 
          :key="album.id" 
          :album="album" 
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AlbumCard from './components/AlbumCard.vue'
import AdminDataView from './components/AdminDataView.vue'
import type { Album } from './types/album'
import { loadAlbums, resetAlbums } from './services/albumStorage'

const albums = ref<Album[]>([])
const isAdmin = ref(false)
const loading = ref<boolean>(true)
const error = ref<string | null>(null)

const readCollection = (read: () => Album[]): void => {
  try {
    loading.value = true
    error.value = null
    albums.value = read()
  } catch (err) {
    error.value = `Unable to access the saved collection: ${err instanceof Error ? err.message : String(err)}. Allow local storage and try again, or reset demo data if the saved collection is invalid.`
    console.error('Error accessing album storage:', err)
  } finally {
    loading.value = false
  }
}

const fetchAlbums = (): void => readCollection(() => loadAlbums())

const resetDemoData = (): void => {
  if (window.confirm('Replace the saved album collection with the original demo data?')) {
    readCollection(() => resetAlbums())
  }
}

onMounted(() => {
  fetchAlbums()
})
</script>

<style scoped>
.app-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  min-height: 72px;
  box-sizing: border-box;
  padding: 14px 28px;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.app-brand {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.app-navigation button {
  padding: 0.75rem 1.5rem;
  border: 2px solid white;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font: inherit;
  cursor: pointer;
}

.app-navigation button:hover { background: white; color: #764ba2; }
.app-navigation button:focus-visible { outline: 3px solid white; outline-offset: 3px; }

.app {
  min-height: 100vh;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.header .storage-note {
  font-size: 0.95rem;
}

.empty {
  color: white;
  text-align: center;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 4rem;
  color: white;
}

.error p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.retry-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: white;
  color: #667eea;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

@media (max-width: 768px) {
  .app {
    padding: 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .albums-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
