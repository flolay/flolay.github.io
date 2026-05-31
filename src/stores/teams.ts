import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, addDoc, getDocs, query, where, doc, updateDoc, writeBatch, deleteField } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuthStore } from './auth'
import { useUserProfileStore } from './userProfile'

interface Team {
  id: string
  name: string
  description: string
  iconUrl?: string
  createdAt: string
  updatedAt?: string
  isWinner?: boolean // Legacy property for backward compatibility
  wonAt?: string // Legacy property for backward compatibility
  winnerCodes?: string[] // Array of all winning codes this team has earned
  poolEntries?: number // Number of entries in the final prize pool
  finalWinner?: {
    place: number // 1, 2, 3 for final ranking
    wonAt: string
    prize: string
  }
  members: {
    [userId: string]: {
      role: 'team_lead' | 'team_member'
      joinedAt: string
    }
  }
}

export const useTeamsStore = defineStore('teams', () => {
  const authStore = useAuthStore()
  const userProfileStore = useUserProfileStore()
  const teams = ref<Team[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentTeam = ref<Team | null>(null)

  const userTeams = computed(() => {
    if (!authStore.user?.uid) return []
    return teams.value.filter(team => team.members[authStore.user!.uid])
  })

  const isTeamLead = computed(() => {
    if (!authStore.user?.uid || !currentTeam.value) return false
    return currentTeam.value.members[authStore.user.uid]?.role === 'team_lead'
  })

  function reset() {
    teams.value = []
    loading.value = false
    error.value = null
    currentTeam.value = null
  }

  async function loadTeams() {
    if (!authStore.user?.uid) return
    
    try {
      loading.value = true
      error.value = null
      
      // Query teams where the user is a member
      const teamsQuery = query(
        collection(db, 'teams'),
        where(`members.${authStore.user.uid}`, '!=', null)
      )
      
      const querySnapshot = await getDocs(teamsQuery)
      teams.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Team[]
    } catch (err) {
      console.error('Error loading teams:', err)
      error.value = 'Failed to load teams'
    } finally {
      loading.value = false
    }
  }

  async function createTeam(name: string, description: string) {
    if (!authStore.user?.uid) return
    
    try {
      loading.value = true
      error.value = null
      
      const teamData = {
        name,
        description,
        iconUrl: '', // Will be updated after generation
        createdAt: new Date().toISOString(),
        members: {
          [authStore.user.uid]: {
            role: 'team_lead',
            joinedAt: new Date().toISOString()
          }
        }
      }
      
      const docRef = await addDoc(collection(db, 'teams'), teamData)
      console.log('Team created with ID:', docRef.id)
      
      // Update user's profile with team ID and set as team lead
      await authStore.setUserAsTeamLead(authStore.user.uid)
      await userProfileStore.updateProfile({
        teamId: docRef.id
      })
      
      // Reload teams and set current team
      await loadTeams()
      currentTeam.value = {
        id: docRef.id,
        ...teamData
      } as Team
      
      return docRef.id // Return the team ID for navigation
    } catch (err) {
      console.error('Error creating team:', err)
      error.value = 'Failed to create team'
      return null
    } finally {
      loading.value = false
    }
  }

  async function joinTeam(teamId: string) {
    if (!authStore.user?.uid) return
    
    try {
      loading.value = true
      error.value = null
      
      const teamRef = doc(db, 'teams', teamId)
      await updateDoc(teamRef, {
        [`members.${authStore.user.uid}`]: {
          role: 'team_member',
          joinedAt: new Date().toISOString()
        }
      })
      
      // Update user's role to team_member if not already a team_lead
      if (userProfileStore.role !== 'team_lead') {
        await userProfileStore.updateProfile({
          role: 'team_member',
          teamId: teamId // Add the teamId to the user's profile
        })
      }
      
      // Reload teams and set the joined team as current
      await loadTeams()
      currentTeam.value = teams.value.find(team => team.id === teamId) || null
    } catch (err) {
      console.error('Error joining team:', err)
      error.value = 'Failed to join team'
    } finally {
      loading.value = false
    }
  }

  async function setCurrentTeam(teamId: string) {
    currentTeam.value = teams.value.find(team => team.id === teamId) || null
  }

  async function leaveTeam(teamId: string) {
    if (!authStore.user?.uid) return
    
    try {
      loading.value = true
      error.value = null
      
      const teamRef = doc(db, 'teams', teamId)
      await updateDoc(teamRef, {
        [`members.${authStore.user.uid}`]: deleteField()
      })
      
      // Update user's profile to remove teamId and reset role
      await userProfileStore.updateProfile({
        teamId: undefined,
        role: 'team_member'
      })
      
      // Reload teams and clear current team
      await loadTeams()
      currentTeam.value = null
    } catch (err) {
      console.error('Error leaving team:', err)
      error.value = 'Failed to leave team'
    } finally {
      loading.value = false
    }
  }

  async function removeMember(teamId: string, memberId: string) {
    if (!authStore.user?.uid || !isTeamLead.value) {
      throw new Error('Only team leads can remove members')
    }
    
    try {
      loading.value = true
      error.value = null
      
      // Remove member from team
      const teamRef = doc(db, 'teams', teamId)
      await updateDoc(teamRef, {
        [`members.${memberId}`]: deleteField()
      })
      
      // Update member's profile to remove teamId
      const memberProfileRef = doc(db, 'users', memberId)
      await updateDoc(memberProfileRef, {
        teamId: null,
        role: 'team_member'
      })
      
      // Reload teams
      await loadTeams()
    } catch (err) {
      console.error('Error removing team member:', err)
      error.value = 'Failed to remove team member'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTeam(teamId: string) {
    if (!authStore.user?.uid || !isTeamLead.value) {
      throw new Error('Only team leads can delete teams')
    }
    
    try {
      loading.value = true
      error.value = null
      
      // Get all team members
      const team = teams.value.find(t => t.id === teamId)
      if (!team) throw new Error('Team not found')
      
      const memberIds = Object.keys(team.members)
      
      // Start a batch write
      const batch = writeBatch(db)
      
      // Delete the team document
      const teamRef = doc(db, 'teams', teamId)
      batch.delete(teamRef)
      
      // Update all members' profiles to remove teamId
      for (const memberId of memberIds) {
        const memberProfileRef = doc(db, 'users', memberId)
        batch.update(memberProfileRef, {
          teamId: null,
          role: 'team_member'
        })
      }
      
      // Commit the batch
      await batch.commit()
      
      // Reload teams and clear current team
      await loadTeams()
      currentTeam.value = null
    } catch (err) {
      console.error('Error deleting team:', err)
      error.value = 'Failed to delete team'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Legacy method for backward compatibility with codes store
  async function markTeamAsWinner(teamId: string, winningCode: string) {
    try {
      loading.value = true
      error.value = null
      
      const teamRef = doc(db, 'teams', teamId)
      const team = teams.value.find(t => t.id === teamId)
      const currentWinnerCodes = team?.winnerCodes || []
      const newWinnerCodes = [...currentWinnerCodes, winningCode]
      
      await updateDoc(teamRef, {
        isWinner: true, // Legacy property
        wonAt: new Date().toISOString(), // Legacy property
        winnerCodes: newWinnerCodes,
        poolEntries: newWinnerCodes.length,
        updatedAt: new Date().toISOString()
      })
      
      // Reload teams
      await loadTeams()
    } catch (err) {
      console.error('Error marking team as winner:', err)
      error.value = 'Failed to mark team as winner'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addWinnerCodeToTeam(teamId: string, winningCode: string) {
    if (!authStore.isAdmin) {
      throw new Error('Only admins can add winner codes')
    }
    
    try {
      loading.value = true
      error.value = null
      
      const teamRef = doc(db, 'teams', teamId)
      const team = teams.value.find(t => t.id === teamId)
      const currentWinnerCodes = team?.winnerCodes || []
      const newWinnerCodes = [...currentWinnerCodes, winningCode]
      
      await updateDoc(teamRef, {
        winnerCodes: newWinnerCodes,
        poolEntries: newWinnerCodes.length, // One entry per winning code
        updatedAt: new Date().toISOString()
      })
      
      // Reload teams
      await loadTeams()
    } catch (err) {
      console.error('Error adding winner code to team:', err)
      error.value = 'Failed to add winner code'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getTeamsInPool() {
    try {
      const teamsQuery = query(collection(db, 'teams'))
      const querySnapshot = await getDocs(teamsQuery)
      
      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Team))
        .filter(team => team.poolEntries && team.poolEntries > 0)
        .sort((a, b) => (b.poolEntries || 0) - (a.poolEntries || 0))
    } catch (err) {
      console.error('Error getting teams in pool:', err)
      throw err
    }
  }

  async function conductFinalDraw() {
    if (!authStore.isAdmin) {
      throw new Error('Only admins can conduct the final draw')
    }
    
    try {
      loading.value = true
      error.value = null
      
      const teamsInPool = await getTeamsInPool()
      
      // Create weighted pool (each winner code = one entry)
      const weightedPool: string[] = []
      teamsInPool.forEach(team => {
        for (let i = 0; i < (team.poolEntries || 0); i++) {
          weightedPool.push(team.id)
        }
      })
      
      if (weightedPool.length === 0) {
        throw new Error('No teams in the winner pool')
      }
      
      // Draw winners
      const winners: { teamId: string; place: number; prize: string }[] = []
      const selectedTeamIds = new Set<string>() // Track already selected teams
      let availablePool = [...weightedPool] // Use weighted pool for selection
      
      const prizes = [
        'Hauptgewinn + Sieger-Trophäe',
        'Toller Gewinn aus dem Lostopf',
        'Schöner Gewinn aus dem Lostopf'
      ]
      
      // Get unique teams in pool for validation
      const uniqueTeams = [...new Set(weightedPool)]
      
      for (let place = 1; place <= Math.min(3, uniqueTeams.length); place++) {
        // Keep drawing until we get a team that hasn't won yet
        let winnerTeamId: string | null = null
        
        while (!winnerTeamId && availablePool.length > 0) {
          const randomIndex = Math.floor(Math.random() * availablePool.length)
          const candidateTeamId = availablePool[randomIndex]
          
          if (!selectedTeamIds.has(candidateTeamId)) {
            winnerTeamId = candidateTeamId
            selectedTeamIds.add(candidateTeamId)
          }
          
          // Remove this entry from the pool (whether selected or not)
          availablePool.splice(randomIndex, 1)
        }
        
        if (winnerTeamId) {
          winners.push({
            teamId: winnerTeamId,
            place,
            prize: prizes[place - 1]
          })
        }
      }
      
      // Update teams with final results
      const batch = writeBatch(db)
      
      winners.forEach(winner => {
        const teamRef = doc(db, 'teams', winner.teamId)
        batch.update(teamRef, {
          finalWinner: {
            place: winner.place,
            wonAt: new Date().toISOString(),
            prize: winner.prize
          },
          updatedAt: new Date().toISOString()
        })
      })
      
      await batch.commit()
      await loadTeams()
      
      return winners
    } catch (err) {
      console.error('Error conducting final draw:', err)
      error.value = 'Failed to conduct final draw'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getFinalWinners() {
    try {
      const teamsQuery = query(collection(db, 'teams'))
      const querySnapshot = await getDocs(teamsQuery)
      
      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Team))
        .filter(team => team.finalWinner)
        .sort((a, b) => (a.finalWinner?.place || 999) - (b.finalWinner?.place || 999))
    } catch (err) {
      console.error('Error getting final winners:', err)
      throw err
    }
  }


  // Initialize the store
  if (authStore.isAuthenticated) {
    loadTeams()
  }

  async function resetWinnerPool() {
    if (!authStore.isAdmin) {
      throw new Error('Only admins can reset the winner pool')
    }
    
    try {
      loading.value = true
      error.value = null
      
      // Get all teams
      const teamsQuery = query(collection(db, 'teams'))
      const querySnapshot = await getDocs(teamsQuery)
      
      const batch = writeBatch(db)
      
      // Reset all teams
      querySnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          winnerCodes: [],
          poolEntries: 0,
          finalWinner: deleteField(),
          isWinner: false, // Legacy field
          wonAt: deleteField(), // Legacy field
          updatedAt: new Date().toISOString()
        })
      })
      
      await batch.commit()
      await loadTeams()
    } catch (err) {
      console.error('Error resetting winner pool:', err)
      error.value = 'Failed to reset winner pool'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    teams,
    userTeams,
    currentTeam,
    loading,
    error,
    isTeamLead,
    loadTeams,
    createTeam,
    joinTeam,
    setCurrentTeam,
    leaveTeam,
    reset,
    removeMember,
    deleteTeam,
    markTeamAsWinner,
    addWinnerCodeToTeam,
    getTeamsInPool,
    conductFinalDraw,
    getFinalWinners,
    resetWinnerPool
  }
}) 