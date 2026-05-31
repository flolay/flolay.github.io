<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
    <div class="container mx-auto px-4 py-8">
      <!-- No Team View -->
      <div v-if="!currentTeam" class="max-w-3xl mx-auto">
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center border border-white/50">
          <div class="relative mb-8">
            <div class="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full blur-xl opacity-20"></div>
            <div class="relative w-32 h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <Users class="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h2 class="text-5xl font-black mb-6 gradient-text">Team beitreten oder erstellen</h2>
          <p class="text-gray-600 mb-12 text-xl leading-relaxed max-w-lg mx-auto">
            Du bist noch nicht in einem Team! Erstelle ein neues Team oder tritt einem bestehenden bei, um am Wettkampf teilzunehmen.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              @click="showCreateTeamDialog = true" 
              class="group relative bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 py-6 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl border border-primary-300"
            >
              <div class="flex items-center justify-center space-x-3">
                <div class="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users class="w-5 h-5" />
                </div>
                <span>Team erstellen</span>
              </div>
            </button>
            <button 
              @click="showJoinTeamDialog = true" 
              class="group relative bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700 py-6 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl border border-secondary-300"
            >
              <div class="flex items-center justify-center space-x-3">
                <div class="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <Hash class="w-5 h-5" />
                </div>
                <span>Team beitreten</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Team View -->
      <div v-else class="space-y-8">
        <!-- Team Header Card -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/50">
          <div class="flex flex-col lg:flex-row items-start lg:items-start lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
              <div class="relative flex-shrink-0">
                <div class="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-3xl blur-xl opacity-30"></div>
                <img
                  v-if="currentTeam.iconUrl"
                  :src="currentTeam.iconUrl"
                  :alt="currentTeam.name"
                  class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover shadow-2xl border-4 border-white"
                />
                <div v-else class="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white">
                  <Users class="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
              </div>
              
              <div class="flex-1 min-w-0">
                <input
                  v-if="isTeamLead"
                  v-model="currentTeam.name"
                  @blur="updateTeam"
                  class="text-2xl sm:text-3xl lg:text-4xl font-black bg-transparent border-b-2 border-transparent hover:border-primary-300 focus:border-primary-500 focus:outline-none gradient-text bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent w-full"
                />
                <h1 v-else class="text-2xl sm:text-3xl lg:text-4xl font-black gradient-text break-words">{{ currentTeam.name }}</h1>
                
                <input
                  v-if="isTeamLead"
                  v-model="currentTeam.description"
                  @blur="updateTeam"
                  class="text-gray-600 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none w-full text-base sm:text-lg mt-2"
                  placeholder="Add team description..."
                />
                <p v-else class="text-gray-600 text-base sm:text-lg mt-2 break-words">{{ currentTeam.description || 'No description' }}</p>
              </div>
            </div>
            
            <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-start lg:justify-end">
              <button
                @click="refreshData"
                :disabled="loading"
                class="p-2 sm:p-3 bg-white/50 backdrop-blur-sm text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-200"
                title="Daten aktualisieren"
              >
                <RefreshCw :class="['w-4 h-4 sm:w-5 sm:h-5', loading && 'animate-spin']" />
              </button>
              
              
              <span v-if="isTeamLead" class="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg whitespace-nowrap">
                Team Lead
              </span>
              
              <button
                v-if="!isTeamLead"
                @click="showLeaveTeamDialog = true"
                class="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap"
              >
                Team verlassen
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Team Members -->
            <div>
              <h3 class="text-2xl font-bold mb-6 flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <Users class="w-5 h-5 text-white" />
                </div>
                <span>Team Members</span>
              </h3>
              <div class="space-y-4">
                <div
                  v-for="member in teamMembers"
                  :key="member.id"
                  class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 gap-3 sm:gap-0"
                >
                  <div class="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div class="relative flex-shrink-0">
                      <img
                        v-if="member.photoURL"
                        :src="member.photoURL"
                        :alt="member.displayName"
                        class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover shadow-lg border-2 border-white"
                      />
                      <div v-else class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <User class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div v-if="member.role === 'team_lead'" class="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                        <Trophy class="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                      </div>
                    </div>
                    
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-base sm:text-lg flex flex-wrap items-center gap-2">
                        <span class="break-words">{{ member.displayName }}</span>
                        <span v-if="member.id === authStore.user?.uid" class="text-xs sm:text-sm text-primary-600 px-2 py-0.5 sm:py-1 bg-primary-50 rounded-lg font-medium whitespace-nowrap">
                          Du
                        </span>
                      </div>
                      <div class="text-xs sm:text-sm text-gray-500 font-medium">
                        {{ member.role === 'team_lead' ? 'Team Lead' : 'Team-Mitglied' }}
                      </div>
                      <!-- Show codes used by this member -->
                      <div v-if="getMemberCodes(member.id).length > 0" class="mt-2">
                        <div class="flex flex-wrap gap-1">
                          <span 
                            v-for="code in getMemberCodes(member.id)" 
                            :key="code.id"
                            :class="[
                              'px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full font-medium',
                              code.isWinner ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            ]"
                            :title="`Eingelöst am ${new Date(code.usedAt).toLocaleDateString('de-DE')}`"
                          >
                            {{ code.code }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    v-if="isTeamLead && member.id !== authStore.user?.uid"
                    @click="() => { showRemoveMemberDialog = true; memberToRemove = member }"
                    class="text-red-500 hover:bg-red-50 p-2 sm:p-3 rounded-xl transition-all duration-300 transform hover:scale-105 self-end sm:self-auto"
                  >
                    <UserMinus class="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Team Actions -->
            <div>
              <h3 class="text-2xl font-bold mb-6 flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
                  <Hash class="w-5 h-5 text-white" />
                </div>
                <span>Team Actions</span>
              </h3>
              
              <!-- Scratch Card Game -->
              <div class="bg-gradient-to-br from-primary-50 via-purple-50 to-secondary-50 p-6 rounded-2xl mb-6 border border-primary-200 shadow-lg">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Hash class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 class="font-bold text-lg text-primary-800">Competition Codes</h4>
                    <p class="text-sm text-gray-600">Enter codes to reveal prizes!</p>
                  </div>
                </div>
                <button @click="showScratchCard = true" class="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <div class="flex items-center justify-center space-x-2">
                    <Hash class="w-5 h-5" />
                    <span>Enter Code</span>
                  </div>
                </button>
              </div>

              <!-- Competition Win Claim -->
              <div class="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 rounded-2xl mb-6 border border-green-200 shadow-lg">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Trophy class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 class="font-bold text-lg text-green-800">Competition Sieg</h4>
                    <p class="text-sm text-gray-600">Melde einen gewonnenen Wettkampf</p>
                  </div>
                </div>
                <button @click="showClaimWinDialog = true" class="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <div class="flex items-center justify-center space-x-2">
                    <Trophy class="w-5 h-5" />
                    <span>Sieg eintragen</span>
                  </div>
                </button>
              </div>

              <!-- Pending Confirmations (against your team) -->
              <div v-if="competitionsStore.pendingAgainstTeam.length > 0" class="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6 rounded-2xl mb-6 border border-orange-200 shadow-lg">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <AlertCircle class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span class="font-black text-lg text-orange-800">Ausstehende Bestätigungen</span>
                    <p class="text-sm text-orange-700">Teams behaupten gegen euch gewonnen zu haben</p>
                  </div>
                </div>
                <div class="space-y-3">
                  <div
                    v-for="claim in competitionsStore.pendingAgainstTeam"
                    :key="claim.id"
                    class="bg-white rounded-xl p-4 shadow-md border border-orange-100"
                  >
                    <p class="font-bold text-gray-800 mb-3">
                      <span class="text-orange-600">{{ claim.claimingTeamName }}</span> behauptet gewonnen zu haben
                    </p>
                    <div class="flex gap-3">
                      <button
                        @click="handleConfirmWin(claim.id)"
                        :disabled="competitionsStore.loading"
                        class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                      >
                        Bestätigen
                      </button>
                      <button
                        @click="handleDeclineWin(claim.id)"
                        :disabled="competitionsStore.loading"
                        class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                      >
                        Ablehnen
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Your Team's Claims -->
              <div v-if="competitionsStore.teamClaims.length > 0" class="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 p-6 rounded-2xl mb-6 border border-purple-200 shadow-lg">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Trophy class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span class="font-black text-lg text-purple-800">Deine Siege</span>
                    <p class="text-sm text-purple-700">Status eurer gemeldeten Siege</p>
                  </div>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="claim in competitionsStore.teamClaims"
                    :key="claim.id"
                    class="bg-white rounded-xl p-3 shadow-sm border border-purple-100 flex items-center justify-between"
                  >
                    <span class="font-medium text-gray-800">vs. {{ claim.opponentTeamName }}</span>
                    <span
                      :class="[
                        'px-3 py-1 rounded-full text-xs font-bold',
                        claim.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        claim.status === 'declined' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      ]"
                    >
                      {{ claim.status === 'confirmed' ? 'Bestätigt' : claim.status === 'declined' ? 'Abgelehnt' : 'Ausstehend' }}
                      <template v-if="claim.status === 'confirmed' && claim.awardedCode"> — Code: {{ claim.awardedCode }}</template>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Team Lead Actions -->
              <div v-if="isTeamLead" class="space-y-4 mb-6">
                <button @click="generateInviteLink" class="w-full bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-600 hover:to-secondary-700 py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Generate Invite Link
                </button>
                <button @click="showDeleteTeamDialog = true" class="w-full bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Delete Team
                </button>
              </div>

              <!-- Team Codes List -->
              <div v-if="teamUsedCodes.length > 0" class="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 border-2 border-blue-300 p-6 rounded-2xl shadow-xl mb-6">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Hash class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span class="font-black text-xl text-blue-800">Eingelöste Codes</span>
                    <p class="text-sm text-blue-700 font-medium">
                      {{ teamUsedCodes.length }} Code{{ teamUsedCodes.length !== 1 ? 's' : '' }} gesammelt
                    </p>
                  </div>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <span 
                    v-for="code in teamUsedCodes" 
                    :key="code.id"
                    class="px-3 py-2 bg-blue-200/50 text-blue-800 rounded-xl text-sm font-medium text-center"
                    :title="`Eingelöst von ${getMemberName(code.usedBy)} am ${new Date(code.usedAt).toLocaleDateString('de-DE')}`"
                  >
                    {{ code.code }}
                  </span>
                </div>
                <p class="text-xs text-blue-600 mt-3 text-center">
                  Diese Codes berechtigen zur Teilnahme an der finalen Verlosung
                </p>
              </div>

              <!-- Winner Badge (only shown after final drawing sets winner) -->
              <div v-if="currentTeam.finalWinner" class="bg-gradient-to-br from-yellow-50 via-yellow-100 to-orange-50 border-2 border-yellow-300 p-6 rounded-2xl shadow-xl">
                <div class="flex items-center space-x-3 mb-3">
                  <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Trophy class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span class="font-black text-xl text-yellow-800">🎉 {{ currentTeam.finalWinner.place }}. Platz! 🎉</span>
                    <p class="text-sm text-yellow-700 font-medium">
                      {{ currentTeam.finalWinner.prize }}
                    </p>
                  </div>
                </div>
                <p class="text-sm text-yellow-700 bg-yellow-200/50 rounded-xl px-4 py-2">
                  Gewonnen am {{ new Date(currentTeam.finalWinner.wonAt).toLocaleDateString('de-DE') }} 🏆
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scratch Card Modal -->
    <div v-if="showScratchCard" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white rounded-t-3xl">
          <div class="flex justify-between items-center">
            <h2 class="text-3xl font-bold">Competition Code</h2>
            <button @click="showScratchCard = false" class="text-white/80 hover:text-white transition-colors">
              <X class="w-8 h-8" />
            </button>
          </div>
        </div>
        <div class="p-6">
          <ScratchCardGame />
        </div>
      </div>
    </div>

    <!-- Create Team Dialog -->
    <div v-if="showCreateTeamDialog" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        <div class="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white rounded-t-3xl">
          <h3 class="text-2xl font-bold">Create New Team</h3>
        </div>
        <div class="p-6">
          <form @submit.prevent="createTeam">
            <div class="mb-6">
              <label class="block text-sm font-semibold mb-2 text-gray-700">Team Name *</label>
              <input
                v-model="newTeamName"
                type="text"
                class="input-field"
                placeholder="Enter team name"
                required
              />
            </div>
            <div class="mb-8">
              <label class="block text-sm font-semibold mb-2 text-gray-700">Description</label>
              <textarea
                v-model="newTeamDescription"
                class="input-field"
                rows="3"
                placeholder="Enter team description"
              ></textarea>
            </div>
            <div class="flex space-x-4">
              <button type="submit" :disabled="loading" class="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 py-3 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">
                <div class="flex items-center justify-center space-x-2">
                  <Loader2 v-if="loading" class="animate-spin w-5 h-5" />
                  <span>Create Team</span>
                </div>
              </button>
              <button type="button" @click="showCreateTeamDialog = false" class="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 px-6 rounded-xl font-bold transition-all duration-300">
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Join Team Dialog -->
    <div v-if="showJoinTeamDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="p-6">
          <h3 class="text-xl font-bold mb-4">Join Team</h3>
          <form @submit.prevent="joinTeam">
            <div class="mb-6">
              <label class="block text-sm font-medium mb-1">Select Team</label>
              <select v-model="selectedTeamToJoin" class="input-field" required>
                <option value="">Choose a team...</option>
                <option v-for="team in availableTeams" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>
            <div class="flex space-x-3">
              <button type="submit" :disabled="loading" class="btn btn-primary flex-1">
                <Loader2 v-if="loading" class="animate-spin mr-2" :size="20" />
                Team beitreten
              </button>
              <button type="button" @click="showJoinTeamDialog = false" class="btn btn-secondary flex-1">
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Invite Link Dialog -->
    <div v-if="showInviteDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="p-6">
          <h3 class="text-xl font-bold mb-4">Team Invite Link</h3>
          <div class="mb-4">
            <input
              v-model="inviteLink"
              type="text"
              class="input-field"
              readonly
            />
          </div>
          <button @click="copyInviteLink" class="btn btn-primary w-full">
            Copy Link
          </button>
        </div>
      </div>
    </div>

    <!-- Leave Team Dialog -->
    <div v-if="showLeaveTeamDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="p-6">
          <h3 class="text-xl font-bold mb-4">Leave Team</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to leave "{{ currentTeam?.name }}"? This action cannot be undone.
          </p>
          <div class="flex space-x-3">
            <button @click="leaveTeam" :disabled="loading" class="btn btn-danger flex-1">
              <Loader2 v-if="loading" class="animate-spin mr-2" :size="20" />
            Team verlassen
            </button>
            <button @click="showLeaveTeamDialog = false" class="btn btn-secondary flex-1">
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Remove Member Dialog -->
    <div v-if="showRemoveMemberDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="p-6">
          <h3 class="text-xl font-bold mb-4">Remove Team Member</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to remove {{ memberToRemove?.displayName }} from the team?
          </p>
          <div class="flex space-x-3">
            <button @click="removeMember(memberToRemove)" :disabled="loading" class="btn btn-danger flex-1">
              <Loader2 v-if="loading" class="animate-spin mr-2" :size="20" />
              Mitglied entfernen
            </button>
            <button @click="showRemoveMemberDialog = false" class="btn btn-secondary flex-1">
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Claim Win Dialog -->
    <div v-if="showClaimWinDialog" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        <div class="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white rounded-t-3xl">
          <div class="flex justify-between items-center">
            <h3 class="text-2xl font-bold">Sieg eintragen</h3>
            <button @click="showClaimWinDialog = false" class="text-white/80 hover:text-white">
              <X class="w-6 h-6" />
            </button>
          </div>
        </div>
        <div class="p-6">
          <form @submit.prevent="handleClaimWin">
            <div class="mb-6">
              <label class="block text-sm font-semibold mb-2 text-gray-700">Gegen welches Team habt ihr gewonnen?</label>
              <select v-model="selectedOpponentTeamId" class="input-field" required>
                <option value="">Team auswählen...</option>
                <option
                  v-for="team in opponentTeams"
                  :key="team.id"
                  :value="team.id"
                >
                  {{ team.name }}
                </option>
              </select>
            </div>
            <div class="flex space-x-4">
              <button
                type="submit"
                :disabled="!selectedOpponentTeamId || competitionsStore.loading"
                class="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 py-3 px-6 rounded-xl font-bold transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                <div class="flex items-center justify-center space-x-2">
                  <Loader2 v-if="competitionsStore.loading" class="animate-spin w-5 h-5" />
                  <span>Sieg melden</span>
                </div>
              </button>
              <button type="button" @click="showClaimWinDialog = false" class="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 px-6 rounded-xl font-bold transition-all duration-300">
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Team Dialog -->
    <div v-if="showDeleteTeamDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="p-6">
          <h3 class="text-xl font-bold mb-4">Delete Team</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete "{{ currentTeam?.name }}"? This will remove all members and cannot be undone.
          </p>
          <div class="flex space-x-3">
            <button @click="deleteTeam" :disabled="loading" class="btn btn-danger flex-1">
              <Loader2 v-if="loading" class="animate-spin mr-2" :size="20" />
              Team löschen
            </button>
            <button @click="showDeleteTeamDialog = false" class="btn btn-secondary flex-1">
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTeamsStore } from '@/stores/teams'
import { useCodesStore } from '@/stores/codes'
import { notify } from '@kyvg/vue3-notification'
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import ScratchCardGame from '@/components/ScratchCardGame.vue'
import { useCompetitionsStore } from '@/stores/competitions'
import { Users, Trophy, RefreshCw, UserMinus, Hash, User, X, Loader2, AlertCircle } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const teamsStore = useTeamsStore()
const codesStore = useCodesStore()
const competitionsStore = useCompetitionsStore()

const showCreateTeamDialog = ref(false)
const showJoinTeamDialog = ref(false)
const showInviteDialog = ref(false)
const showLeaveTeamDialog = ref(false)
const showDeleteTeamDialog = ref(false)
const showRemoveMemberDialog = ref(false)
const showScratchCard = ref(false)
const memberToRemove = ref<any>(null)
const showClaimWinDialog = ref(false)
const selectedOpponentTeamId = ref('')

const newTeamName = ref('')
const newTeamDescription = ref('')
const selectedTeamToJoin = ref('')
const inviteLink = ref('')
const availableTeams = ref<any[]>([])
const teamMembers = ref<any[]>([])
const teamUsedCodes = ref<any[]>([])

const currentTeam = computed(() => teamsStore.currentTeam)
const isTeamLead = computed(() => teamsStore.isTeamLead)
const loading = computed(() => teamsStore.loading)

const opponentTeams = computed(() => {
  if (!currentTeam.value) return []
  return availableTeams.value.filter(t => t.id !== currentTeam.value!.id)
})

async function handleClaimWin() {
  if (!selectedOpponentTeamId.value) return
  const opponent = availableTeams.value.find(t => t.id === selectedOpponentTeamId.value)
  if (!opponent) return

  try {
    await competitionsStore.claimWin(selectedOpponentTeamId.value, opponent.name)
    showClaimWinDialog.value = false
    selectedOpponentTeamId.value = ''
    notify({
      title: 'Sieg gemeldet',
      text: `Warte auf Bestätigung von ${opponent.name}`,
      type: 'success'
    })
  } catch (err) {
    notify({
      title: 'Fehler',
      text: 'Sieg konnte nicht gemeldet werden',
      type: 'error'
    })
  }
}

async function handleConfirmWin(resultId: string) {
  try {
    const code = await competitionsStore.confirmWin(resultId)
    notify({
      title: 'Bestätigt',
      text: `Sieg bestätigt. Code ${code} wurde vergeben.`,
      type: 'success'
    })
  } catch (err: any) {
    notify({
      title: 'Fehler',
      text: err.message || 'Bestätigung fehlgeschlagen',
      type: 'error'
    })
  }
}

async function handleDeclineWin(resultId: string) {
  try {
    await competitionsStore.declineWin(resultId)
    notify({
      title: 'Abgelehnt',
      text: 'Siegmeldung wurde abgelehnt',
      type: 'warn'
    })
  } catch (err) {
    notify({
      title: 'Fehler',
      text: 'Ablehnung fehlgeschlagen',
      type: 'error'
    })
  }
}

function getMemberCodes(memberId: string) {
  return teamUsedCodes.value.filter(code => code.usedBy === memberId)
}

function getMemberName(memberId: string) {
  const member = teamMembers.value.find(m => m.id === memberId)
  return member ? member.displayName : 'Unbekannt'
}

async function loadTeamMembers() {
  if (!currentTeam.value) return
  
  try {
    const membersQuery = query(
      collection(db, 'users'),
      where('teamId', '==', currentTeam.value.id)
    )
    
    const querySnapshot = await getDocs(membersQuery)
    teamMembers.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error loading team members:', error)
  }
}

async function loadTeamCodes() {
  if (!currentTeam.value) return
  
  try {
    const codesQuery = query(
      collection(db, 'codes'),
      where('usedByTeam', '==', currentTeam.value.id)
    )
    
    const querySnapshot = await getDocs(codesQuery)
    teamUsedCodes.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error loading team codes:', error)
  }
}

async function loadAvailableTeams() {
  try {
    const teamsQuery = query(collection(db, 'teams'))
    const querySnapshot = await getDocs(teamsQuery)
    availableTeams.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error loading available teams:', error)
  }
}

async function createTeam() {
  if (!newTeamName.value) return
  
  const teamId = await teamsStore.createTeam(newTeamName.value, newTeamDescription.value)
  showCreateTeamDialog.value = false
  newTeamName.value = ''
  newTeamDescription.value = ''
  
  if (teamId) {
    await teamsStore.setCurrentTeam(teamId)
    router.push({ name: 'team-detail', params: { teamId } })
  }
}

async function joinTeam() {
  if (!selectedTeamToJoin.value) return
  
  await teamsStore.joinTeam(selectedTeamToJoin.value)
  showJoinTeamDialog.value = false
  selectedTeamToJoin.value = ''
}

async function updateTeam() {
  if (!currentTeam.value) return
  
  try {
    const teamRef = doc(db, 'teams', currentTeam.value.id)
    await updateDoc(teamRef, {
      name: currentTeam.value.name,
      description: currentTeam.value.description,
      updatedAt: new Date().toISOString()
    })
    notify({
      title: 'Success',
      text: 'Team updated successfully',
      type: 'success'
    })
  } catch (error) {
    console.error('Error updating team:', error)
    notify({
      title: 'Error',
      text: 'Failed to update team',
      type: 'error'
    })
  }
}

function generateInviteLink() {
  if (!currentTeam.value) return
  
  const baseUrl = window.location.origin
  inviteLink.value = `${baseUrl}/team/join/${currentTeam.value.id}`
  showInviteDialog.value = true
}

async function copyInviteLink() {
  try {
    await navigator.clipboard.writeText(inviteLink.value)
    notify({
      title: 'Success',
      text: 'Invite link copied to clipboard',
      type: 'success'
    })
    showInviteDialog.value = false
  } catch (error) {
    notify({
      title: 'Error',
      text: 'Failed to copy link',
      type: 'error'
    })
  }
}


async function leaveTeam() {
  if (!currentTeam.value) return
  
  try {
    await teamsStore.leaveTeam(currentTeam.value.id)
    showLeaveTeamDialog.value = false
    router.push('/team')
  } catch (error) {
    console.error('Error leaving team:', error)
  }
}

async function removeMember(member: any) {
  if (!member || !currentTeam.value) return
  
  try {
    await teamsStore.removeMember(currentTeam.value.id, member.id)
    showRemoveMemberDialog.value = false
    memberToRemove.value = null
    await Promise.all([
      loadTeamMembers(),
      loadTeamCodes()
    ])
  } catch (error) {
    console.error('Error removing member:', error)
  }
}

async function deleteTeam() {
  if (!currentTeam.value) return
  
  try {
    await teamsStore.deleteTeam(currentTeam.value.id)
    showDeleteTeamDialog.value = false
    router.push('/team')
  } catch (error) {
    console.error('Error deleting team:', error)
  }
}

async function refreshData() {
  try {
    await teamsStore.loadTeams()
    if (currentTeam.value) {
      await Promise.all([
        loadTeamMembers(),
        loadTeamCodes()
      ])
    }
    await loadAvailableTeams()
    
    notify({
      title: 'Erfolg',
      text: 'Daten wurden aktualisiert',
      type: 'success'
    })
  } catch (error) {
    console.error('Error refreshing data:', error)
    notify({
      title: 'Fehler',
      text: 'Daten konnten nicht aktualisiert werden',
      type: 'error'
    })
  }
}

onMounted(async () => {
  await teamsStore.loadTeams()
  await loadAvailableTeams()
  
  if (route.params.teamId) {
    const teamId = route.params.teamId as string
    
    try {
      const teamDoc = await getDoc(doc(db, 'teams', teamId))
      if (!teamDoc.exists()) {
        notify({
          title: 'Error',
          text: 'Team not found',
          type: 'error'
        })
        router.push('/team')
        return
      }
      
      const teamData = teamDoc.data()
      if (teamData.members?.[authStore.user?.uid || '']) {
        await teamsStore.setCurrentTeam(teamId)
      } else if (route.name === 'team-join') {
        await teamsStore.joinTeam(teamId)
        notify({
          title: 'Success',
          text: 'Successfully joined the team!',
          type: 'success'
        })
        await teamsStore.setCurrentTeam(teamId)
      } else {
        notify({
          title: 'Error',
          text: 'You are not a member of this team',
          type: 'error'
        })
        router.push('/team')
        return
      }
    } catch (err) {
      console.error('Error handling team:', err)
      notify({
        title: 'Error',
        text: 'Failed to process team request',
        type: 'error'
      })
      router.push('/team')
      return
    }
  } else if (teamsStore.userTeams.length > 0) {
    await teamsStore.setCurrentTeam(teamsStore.userTeams[0].id)
  }
  
  if (teamsStore.currentTeam) {
    await Promise.all([
      loadTeamMembers(),
      loadTeamCodes()
    ])
    competitionsStore.listenPendingForTeam(teamsStore.currentTeam.id)
    competitionsStore.listenClaimsForTeam(teamsStore.currentTeam.id)
  }
})

watch(() => teamsStore.currentTeam, async (newTeam) => {
  if (newTeam) {
    await Promise.all([
      loadTeamMembers(),
      loadTeamCodes()
    ])
    competitionsStore.listenPendingForTeam(newTeam.id)
    competitionsStore.listenClaimsForTeam(newTeam.id)
  } else {
    competitionsStore.stopListening()
  }
})
</script>