<template>
  <div class="space-y-8">
    <!-- Winner Pool Overview -->
    <div class="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <h3 class="text-2xl font-bold mb-6 gradient-text">Lostopf Übersicht</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Users class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="text-blue-600 font-semibold">Teams im Lostopf</p>
              <p class="text-2xl font-bold text-blue-800">{{ teamsInPool.length }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Hash class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="text-green-600 font-semibold">Gesamt Lose</p>
              <p class="text-2xl font-bold text-green-800">{{ totalEntries }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border border-yellow-200">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Trophy class="w-6 h-6 text-white" />
            </div>
            <div>
              <p class="text-yellow-600 font-semibold">Gewinner gezogen</p>
              <p class="text-2xl font-bold text-yellow-800">{{ finalWinners.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Code Creation Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h4 class="text-lg font-bold">Code-Erstellung</h4>
          <div class="flex items-center space-x-2">
          <button
            v-if="authStore.isAdmin"
            @click="showCreateCodeDialog = true"
            class="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300"
          >
            Neue Codes erstellen
          </button>
          <button
            v-if="authStore.isAdmin && allCodes.length > 0"
            @click="showDeleteAllDialog = true"
            class="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300"
          >
            Alle Codes löschen
          </button>
          <button
            @click="loadData(true)"
            :disabled="loading"
            class="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-3 rounded-xl font-semibold transition-all duration-300"
            title="Daten aktualisieren"
          >
            <svg class="w-5 h-5" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
          </div>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
          <h5 class="font-bold text-blue-800 mb-3">💡 So funktioniert das Code-System:</h5>
          <ul class="space-y-2 text-blue-700">
            <li class="flex items-start space-x-2">
              <span class="text-blue-500 mt-1">1.</span>
              <span>Admin erstellt Codes (manche sind Gewinner, manche nicht)</span>
            </li>
            <li class="flex items-start space-x-2">
              <span class="text-blue-500 mt-1">2.</span>
              <span>Team-Mitglieder geben Codes auf der Team-Seite ein</span>
            </li>
            <li class="flex items-start space-x-2">
              <span class="text-blue-500 mt-1">3.</span>
              <span>Eine Scratch Card zeigt Win oder Lose an</span>
            </li>
            <li class="flex items-start space-x-2">
              <span class="text-blue-500 mt-1">4.</span>
              <span>Bei einem Gewinn wird automatisch ein Los für das Team hinzugefügt</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Code Statistics -->
      <div class="mb-8">
        <h4 class="text-lg font-bold mb-4">Code-Statistiken</h4>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
            <p class="text-gray-600 font-semibold text-sm">Gesamt Codes</p>
            <p class="text-2xl font-bold text-gray-800">{{ allCodes.length }}</p>
          </div>
          <div class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <p class="text-green-600 font-semibold text-sm">Gewinner-Codes</p>
            <p class="text-2xl font-bold text-green-800">{{ winnerCodes.length }}</p>
          </div>
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <p class="text-blue-600 font-semibold text-sm">Verwendete Codes</p>
            <p class="text-2xl font-bold text-blue-800">{{ usedCodes.length }}</p>
          </div>
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <p class="text-purple-600 font-semibold text-sm">Verfügbare Codes</p>
            <p class="text-2xl font-bold text-purple-800">{{ availableCodes.length }}</p>
          </div>
        </div>
      </div>

      <!-- All Codes Table -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h4 class="text-lg font-bold">Alle Codes</h4>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <select 
              v-model="selectedCodeType"
              class="px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto"
            >
              <option value="all">Alle Codes</option>
              <option value="winner">Nur Gewinner</option>
              <option value="loser">Nur Nieten</option>
              <option value="used">Nur Verwendet</option>
              <option value="available">Nur Verfügbar</option>
            </select>
            <input
              v-model="codeSearchTerm"
              type="text"
              placeholder="Code oder Team suchen..."
              class="px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto"
            />
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left py-3 px-4 font-semibold">Code</th>
                <th class="text-left py-3 px-4 font-semibold">Typ</th>
                <th class="text-left py-3 px-4 font-semibold">Status</th>
                <th class="text-left py-3 px-4 font-semibold">Verwendet von</th>
                <th class="text-left py-3 px-4 font-semibold">Verwendet am</th>
                <th class="text-left py-3 px-4 font-semibold">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="code in paginatedCodes" :key="code.id" class="border-b border-gray-100">
                <td class="py-3 px-4">
                  <div class="flex items-center space-x-2">
                    <span class="font-mono font-semibold">{{ code.code }}</span>
                    <button 
                      @click="copyCode(code.code)"
                      class="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Code kopieren"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </button>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span v-if="code.isWinner" class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    Gewinner
                  </span>
                  <span v-else class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                    Niete
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span v-if="code.isUsed" class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    Verwendet
                  </span>
                  <span v-else class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                    Verfügbar
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span v-if="code.usedByTeam" class="text-sm">
                    {{ getTeamName(code.usedByTeam) }}
                  </span>
                  <span v-else class="text-gray-400 text-sm">-</span>
                </td>
                <td class="py-3 px-4">
                  <span v-if="code.usedAt" class="text-sm text-gray-600">
                    {{ new Date(code.usedAt).toLocaleString('de-DE') }}
                  </span>
                  <span v-else class="text-gray-400 text-sm">-</span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center space-x-2">
                    <button 
                      v-if="!code.isUsed"
                      @click="editCode(code)"
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      title="Code bearbeiten"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button 
                      @click="deleteCode(code)"
                      class="text-red-600 hover:text-red-800 text-sm font-medium"
                      title="Code löschen"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 px-4">
            <div class="text-sm text-gray-600">
              Zeige {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredCodes.length) }} von {{ filteredCodes.length }} Codes
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="currentPage = 1"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ««
              </button>
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                «
              </button>
              <span class="px-3 py-1 text-sm">
                Seite {{ currentPage }} von {{ totalPages }}
              </span>
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                »
              </button>
              <button
                @click="currentPage = totalPages"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                »»
              </button>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-if="allCodes.length === 0" class="text-center py-12">
            <Hash class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-600 mb-2">Keine Codes vorhanden</h3>
            <p class="text-gray-500">Erstelle neue Codes mit dem Button oben.</p>
          </div>
        </div>
      </div>

      <!-- Teams in Pool Table -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-bold">Teams im Lostopf</h4>
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <span>Automatische Aktualisierung alle 30 Sekunden</span>
            <button
              @click="loadData(true)"
              :disabled="loading"
              class="text-blue-600 hover:text-blue-800 transition-colors"
              title="Jetzt aktualisieren"
            >
              <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left py-3 px-4 font-semibold">Team</th>
                <th class="text-left py-3 px-4 font-semibold">Gewonnene Codes</th>
                <th class="text-left py-3 px-4 font-semibold">Lose im Topf</th>
                <th class="text-left py-3 px-4 font-semibold">Gewinnchance</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="team in teamsInPool" :key="team.id" class="border-b border-gray-100">
                <td class="py-3 px-4">
                  <div class="flex items-center space-x-3">
                    <img v-if="team.iconUrl" :src="team.iconUrl" :alt="team.name" class="w-8 h-8 rounded-lg" />
                    <div v-else class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                      <Users class="w-4 h-4 text-white" />
                    </div>
                    <span class="font-medium">{{ team.name }}</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="code in (team.winnerCodes || [])" :key="code" 
                          class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {{ code }}
                    </span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                    {{ team.poolEntries || 0 }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span class="text-gray-600">
                    {{ ((team.poolEntries || 0) / totalEntries * 100).toFixed(1) }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Empty State -->
          <div v-if="teamsInPool.length === 0" class="text-center py-12">
            <Hash class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-600 mb-2">Keine Teams im Lostopf</h3>
            <p class="text-gray-500">Teams erscheinen hier, sobald sie Gewinner-Codes eingelöst haben.</p>
          </div>
        </div>
      </div>

      <!-- Final Draw Section -->
      <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-bold flex items-center space-x-2">
            <Zap class="w-5 h-5 text-purple-600" />
            <span>Finale Verlosung</span>
          </h4>
          <button
            @click="loadData(true)"
            :disabled="loading"
            class="text-purple-600 hover:text-purple-800 transition-colors"
            title="Daten aktualisieren"
          >
            <svg class="w-5 h-5" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
        
        <div v-if="finalWinners.length === 0" class="space-y-4">
          <p class="text-gray-600">
            Alle Teams mit Gewinner-Codes nehmen automatisch am finalen Lostopf teil. 
            Je mehr Codes ein Team hat, desto höher die Gewinnchance!
          </p>
          <button 
            v-if="authStore.isAdmin"
            @click="conductDraw"
            :disabled="teamsInPool.length === 0 || loading"
            class="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <Loader2 v-if="loading" class="animate-spin w-5 h-5 mr-2 inline" />
            <Zap v-else class="w-5 h-5 mr-2 inline" />
            Finale Verlosung durchführen
          </button>
          <div v-else class="p-4 bg-gray-100 rounded-xl">
            <p class="text-gray-600">Nur Administratoren können die finale Verlosung durchführen.</p>
          </div>
        </div>

        <!-- Final Winners Display -->
        <div v-else class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <h5 class="font-bold text-lg text-purple-800">🎉 Gewinner der finalen Verlosung:</h5>
            <button 
              v-if="authStore.isAdmin"
              @click="showResetDialog = true"
              class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
            >
              Verlosung zurücksetzen
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="winner in finalWinners" :key="winner.id" 
                 class="flex items-center justify-between p-4 bg-white rounded-xl border border-purple-200">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span class="text-white font-bold">{{ winner.finalWinner?.place }}.</span>
                </div>
                <div>
                  <p class="font-bold text-lg">{{ winner.name }}</p>
                  <p class="text-purple-600">{{ winner.finalWinner?.prize }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500">
                  {{ winner.poolEntries }} Lose im Topf
                </p>
                <p class="text-xs text-gray-400">
                  {{ new Date(winner.finalWinner?.wonAt || '').toLocaleString('de-DE') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Code Dialog -->
    <Teleport to="body">
    <div v-if="showEditCodeDialog" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-3xl">
          <h3 class="text-2xl font-bold">Code bearbeiten</h3>
          <p class="opacity-90">Ändere den Code oder den Typ</p>
        </div>
        
        <div class="p-6">
          <form @submit.prevent="updateCode" class="space-y-6">
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-700">Code</label>
              <input
                v-model="editCodeValue"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                required
              />
              <p class="text-sm text-gray-500 mt-1">Der Code muss eindeutig sein</p>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-700">Typ</label>
              <div class="flex items-center space-x-4">
                <label class="flex items-center">
                  <input
                    v-model="editCodeIsWinner"
                    type="radio"
                    :value="true"
                    class="mr-2"
                  />
                  <span class="text-green-700 font-medium">Gewinner</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="editCodeIsWinner"
                    type="radio"
                    :value="false"
                    class="mr-2"
                  />
                  <span class="text-gray-700 font-medium">Niete</span>
                </label>
              </div>
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button 
                type="submit" 
                :disabled="loading"
                class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 py-3 px-6 rounded-xl font-bold transition-all duration-300"
              >
                <Loader2 v-if="loading" class="animate-spin w-5 h-5 mr-2 inline" />
                Speichern
              </button>
              <button 
                type="button" 
                @click="() => { showEditCodeDialog = false; editingCode = null }"
                class="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 px-6 rounded-xl font-bold transition-all duration-300"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- Create Codes Dialog -->
    <Teleport to="body">
    <div v-if="showCreateCodeDialog" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        <div class="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white rounded-t-3xl">
          <h3 class="text-2xl font-bold">Neue Codes erstellen</h3>
          <p class="opacity-90">Erstelle eine neue Runde von Codes für das Spiel</p>
        </div>
        
        <div class="p-6">
          <form @submit.prevent="createCodes" class="space-y-6">
            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-700">Anzahl Codes</label>
              <input
                v-model.number="newCodeCount"
                type="number"
                min="1"
                max="1000"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <p class="text-sm text-gray-500 mt-1">Wie viele Codes sollen erstellt werden?</p>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2 text-gray-700">Gewinner-Anteil (%)</label>
              <input
                v-model.number="winnerPercentage"
                type="number"
                min="0"
                max="100"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <p class="text-sm text-gray-500 mt-1">
                Prozent der Codes die Gewinner sind ({{ Math.round(newCodeCount * winnerPercentage / 100) }} von {{ newCodeCount }} Codes)
              </p>
            </div>

            <div class="bg-blue-50 p-4 rounded-xl">
              <h4 class="font-semibold text-blue-800 mb-2">📋 Vorschau</h4>
              <div class="text-sm text-blue-700 space-y-1">
                <p>• Gesamt Codes: {{ newCodeCount }}</p>
                <p>• Gewinner-Codes: {{ Math.round(newCodeCount * winnerPercentage / 100) }}</p>
                <p>• Nieten: {{ newCodeCount - Math.round(newCodeCount * winnerPercentage / 100) }}</p>
              </div>
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button 
                type="submit" 
                :disabled="loading"
                class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 py-3 px-6 rounded-xl font-bold transition-all duration-300"
              >
                <Loader2 v-if="loading" class="animate-spin w-5 h-5 mr-2 inline" />
                Codes erstellen
              </button>
              <button 
                type="button" 
                @click="showCreateCodeDialog = false"
                class="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 px-6 rounded-xl font-bold transition-all duration-300"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </Teleport>
    
    <!-- Reset Dialog -->
    <Teleport to="body">
    <div v-if="showResetDialog" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        <div class="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white rounded-t-3xl">
          <h3 class="text-2xl font-bold">Verlosung zurücksetzen</h3>
          <p class="opacity-90">Alle Gewinner und Team-Lose werden zurückgesetzt</p>
        </div>
        
        <div class="p-6">
          <div class="bg-red-50 p-4 rounded-xl mb-6">
            <h4 class="font-semibold text-red-800 mb-2">⚠️ Warnung</h4>
            <p class="text-sm text-red-700">Diese Aktion wird:</p>
            <ul class="text-sm text-red-700 mt-2 space-y-1">
              <li>• Alle finalen Gewinner entfernen</li>
              <li>• Alle Team-Gewinnercodes zurücksetzen</li>
              <li>• Alle Teams aus dem Lostopf entfernen</li>
              <li>• Diese Aktion kann NICHT rückgängig gemacht werden!</li>
            </ul>
          </div>
          
          <div class="flex space-x-3">
            <button 
              @click="resetWinnerPool"
              :disabled="loading"
              class="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 py-3 px-6 rounded-xl font-bold transition-all duration-300"
            >
              <Loader2 v-if="loading" class="animate-spin w-5 h-5 mr-2 inline" />
              Ja, alles zurücksetzen
            </button>
            <button 
              @click="showResetDialog = false"
              class="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 px-6 rounded-xl font-bold transition-all duration-300"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- Delete All Codes Dialog -->
    <Teleport to="body">
    <div v-if="showDeleteAllDialog" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        <div class="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white rounded-t-3xl">
          <h3 class="text-2xl font-bold">Alle Codes löschen</h3>
          <p class="opacity-90">Alle {{ allCodes.length }} Codes werden unwiderruflich gelöscht</p>
        </div>

        <div class="p-6">
          <div class="bg-red-50 p-4 rounded-xl mb-6">
            <h4 class="font-semibold text-red-800 mb-2">&#x26A0;&#xFE0F; Warnung</h4>
            <p class="text-sm text-red-700">Diese Aktion löscht alle {{ allCodes.length }} Codes ({{ winnerCodes.length }} Gewinner, {{ usedCodes.length }} verwendet). Dies kann NICHT rückgängig gemacht werden!</p>
          </div>

          <div class="flex space-x-3">
            <button
              @click="deleteAllCodes"
              :disabled="loading"
              class="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 py-3 px-6 rounded-xl font-bold transition-all duration-300"
            >
              <Loader2 v-if="loading" class="animate-spin w-5 h-5 mr-2 inline" />
              Ja, alle löschen
            </button>
            <button
              @click="showDeleteAllDialog = false"
              class="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 px-6 rounded-xl font-bold transition-all duration-300"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTeamsStore } from '@/stores/teams'
import { useAuthStore } from '@/stores/auth'
import { useCodesStore } from '@/stores/codes'
import { notify } from '@kyvg/vue3-notification'
import { Users, Hash, Trophy, Zap, Loader2 } from 'lucide-vue-next'

const teamsStore = useTeamsStore()
const authStore = useAuthStore()
const codesStore = useCodesStore()
console.log('Available codesStore methods:', Object.keys(codesStore))

const teamsInPool = ref<any[]>([])
const finalWinners = ref<any[]>([])
const loading = ref(false)
const showCreateCodeDialog = ref(false)
const showEditCodeDialog = ref(false)
const newCodeCount = ref(10)
const winnerPercentage = ref(30)
const codeSearchTerm = ref('')
const selectedCodeType = ref('all') // all, winner, loser, used, available
const editingCode = ref<any>(null)
const editCodeValue = ref('')
const editCodeIsWinner = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10
const showResetDialog = ref(false)
const showDeleteAllDialog = ref(false)

const totalEntries = computed(() => {
  return teamsInPool.value.reduce((sum, team) => sum + (team.poolEntries || 0), 0)
})

const allCodes = computed(() => codesStore.codes || [])
const winnerCodes = computed(() => allCodes.value.filter(code => code.isWinner))
const usedCodes = computed(() => allCodes.value.filter(code => code.isUsed))
const availableCodes = computed(() => allCodes.value.filter(code => !code.isUsed))

const filteredCodes = computed(() => {
  let codes = allCodes.value

  // Filter by type
  switch (selectedCodeType.value) {
    case 'winner':
      codes = codes.filter(code => code.isWinner)
      break
    case 'loser':
      codes = codes.filter(code => !code.isWinner)
      break
    case 'used':
      codes = codes.filter(code => code.isUsed)
      break
    case 'available':
      codes = codes.filter(code => !code.isUsed)
      break
  }

  // Filter by search term
  if (codeSearchTerm.value) {
    const term = codeSearchTerm.value.toLowerCase()
    codes = codes.filter(code => 
      code.code.toLowerCase().includes(term) ||
      (code.usedByTeam && getTeamName(code.usedByTeam).toLowerCase().includes(term))
    )
  }

  return codes
})

const totalPages = computed(() => Math.ceil(filteredCodes.value.length / itemsPerPage))

const paginatedCodes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredCodes.value.slice(start, end)
})

// Reset to page 1 when filters change
watch([selectedCodeType, codeSearchTerm], () => {
  currentPage.value = 1
})

function getTeamName(teamId: string): string {
  const team = teamsStore.teams.find(t => t.id === teamId)
  return team?.name || 'Unbekanntes Team'
}

async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code)
    notify({
      title: 'Erfolg',
      text: `Code ${code} kopiert!`,
      type: 'success'
    })
  } catch (error) {
    console.error('Error copying code:', error)
    notify({
      title: 'Fehler',
      text: 'Code konnte nicht kopiert werden',
      type: 'error'
    })
  }
}

function editCode(code: any) {
  editingCode.value = code
  editCodeValue.value = code.code
  editCodeIsWinner.value = code.isWinner
  showEditCodeDialog.value = true
}

async function updateCode() {
  if (!editingCode.value || !editCodeValue.value) return
  
  try {
    loading.value = true
    // Check if function exists
    if (typeof codesStore.updateCode !== 'function') {
      throw new Error('updateCode function not available in codesStore')
    }
    await codesStore.updateCode(editingCode.value.id, editCodeValue.value, editCodeIsWinner.value)
    
    notify({
      title: 'Erfolg',
      text: 'Code erfolgreich aktualisiert',
      type: 'success'
    })
    
    showEditCodeDialog.value = false
    editingCode.value = null
    await loadData()
  } catch (error) {
    console.error('Error updating code:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
    notify({
      title: 'Fehler',
      text: `Code konnte nicht aktualisiert werden: ${errorMessage}`,
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function deleteCode(code: any) {
  if (!confirm(`Möchten Sie den Code "${code.code}" wirklich löschen?`)) {
    return
  }
  
  try {
    loading.value = true
    // Check if function exists
    if (typeof codesStore.deleteCode !== 'function') {
      throw new Error('deleteCode function not available in codesStore')
    }
    await codesStore.deleteCode(code.id)
    
    notify({
      title: 'Erfolg',
      text: 'Code erfolgreich gelöscht',
      type: 'success'
    })
    
    await loadData()
  } catch (error) {
    console.error('Error deleting code:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
    notify({
      title: 'Fehler',
      text: `Code konnte nicht gelöscht werden: ${errorMessage}`,
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function loadData(showNotification = false) {
  try {
    loading.value = true
    teamsInPool.value = await teamsStore.getTeamsInPool()
    finalWinners.value = await teamsStore.getFinalWinners()
    await codesStore.loadCodes()
    
    if (showNotification) {
      notify({
        title: 'Erfolg',
        text: 'Daten wurden aktualisiert',
        type: 'success'
      })
    }
  } catch (error) {
    console.error('Error loading winner pool data:', error)
    notify({
      title: 'Fehler',
      text: 'Daten konnten nicht geladen werden',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function createCodes() {
  if (!authStore.isAdmin) {
    notify({
      title: 'Fehler',
      text: 'Nur Administratoren können Codes erstellen',
      type: 'error'
    })
    return
  }

  try {
    loading.value = true
    const winnerCount = Math.round(newCodeCount.value * winnerPercentage.value / 100)
    await codesStore.generateCodes(newCodeCount.value, winnerCount)
    
    notify({
      title: 'Erfolg',
      text: `${newCodeCount.value} neue Codes erstellt (${winnerCount} Gewinner-Codes)`,
      type: 'success'
    })
    
    showCreateCodeDialog.value = false
    await loadData()
  } catch (error) {
    console.error('Error creating codes:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler'
    notify({
      title: 'Fehler',
      text: `Codes konnten nicht erstellt werden: ${errorMessage}`,
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function conductDraw() {
  if (teamsInPool.value.length === 0) {
    notify({
      title: 'Fehler',
      text: 'Keine Teams im Lostopf',
      type: 'error'
    })
    return
  }
  
  const confirmed = confirm('Soll die finale Verlosung wirklich durchgeführt werden? Diese Aktion kann nicht rückgängig gemacht werden.')
  if (!confirmed) return
  
  try {
    loading.value = true
    const winners = await teamsStore.conductFinalDraw()
    
    notify({
      title: 'Erfolg',
      text: `Finale Verlosung abgeschlossen! ${winners.length} Gewinner ermittelt.`,
      type: 'success'
    })
    
    await loadData()
  } catch (error) {
    console.error('Error conducting final draw:', error)
    notify({
      title: 'Fehler',
      text: 'Finale Verlosung konnte nicht durchgeführt werden',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Reload data every 30 seconds to catch team changes
let intervalId: number | null = null

onMounted(() => {
  loadData()
  
  // Set up auto-refresh
  intervalId = setInterval(() => {
    loadData()
  }, 30000) // Refresh every 30 seconds
})

onUnmounted(() => {
  // Clean up interval
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// Watch for team changes
watch(() => teamsStore.teams, () => {
  loadData()
}, { deep: true })

// Also watch for specific team events
watch(() => [teamsStore.teams.length, teamsStore.currentTeam], () => {
  // Reload when teams are added/removed or current team changes
  loadData()
})

async function deleteAllCodes() {
  try {
    loading.value = true
    await codesStore.deleteAllCodes()

    notify({
      title: 'Erfolg',
      text: 'Alle Codes wurden gelöscht',
      type: 'success'
    })

    showDeleteAllDialog.value = false
    await loadData()
  } catch (error) {
    console.error('Error deleting all codes:', error)
    notify({
      title: 'Fehler',
      text: 'Codes konnten nicht gelöscht werden',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function resetWinnerPool() {
  try {
    loading.value = true
    await teamsStore.resetWinnerPool()
    
    notify({
      title: 'Erfolg',
      text: 'Alle Gewinner und Team-Lose wurden zurückgesetzt',
      type: 'success'
    })
    
    showResetDialog.value = false
    await loadData()
  } catch (error) {
    console.error('Error resetting winner pool:', error)
    notify({
      title: 'Fehler',
      text: 'Lostopf konnte nicht zurückgesetzt werden',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>