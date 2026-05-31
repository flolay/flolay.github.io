import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, addDoc, getDocs, query, where, doc, updateDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuthStore } from './auth'
import { useTeamsStore } from './teams'
import { useCodesStore } from './codes'

export interface CompetitionResult {
  id: string
  claimingTeamId: string
  claimingTeamName: string
  opponentTeamId: string
  opponentTeamName: string
  claimedBy: string
  claimedAt: string
  status: 'pending' | 'confirmed' | 'declined'
  confirmedBy?: string
  confirmedAt?: string
  awardedCode?: string
}

export const useCompetitionsStore = defineStore('competitions', () => {
  const authStore = useAuthStore()
  const teamsStore = useTeamsStore()
  const codesStore = useCodesStore()

  const pendingAgainstTeam = ref<CompetitionResult[]>([])
  const teamClaims = ref<CompetitionResult[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  let pendingUnsubscribe: Unsubscribe | null = null
  let claimsUnsubscribe: Unsubscribe | null = null

  async function claimWin(opponentTeamId: string, opponentTeamName: string) {
    if (!authStore.user?.uid || !teamsStore.currentTeam) {
      throw new Error('Must be logged in and in a team')
    }

    try {
      loading.value = true
      error.value = null

      const claim: Omit<CompetitionResult, 'id'> = {
        claimingTeamId: teamsStore.currentTeam.id,
        claimingTeamName: teamsStore.currentTeam.name,
        opponentTeamId,
        opponentTeamName,
        claimedBy: authStore.user.uid,
        claimedAt: new Date().toISOString(),
        status: 'pending'
      }

      await addDoc(collection(db, 'competition_results'), claim)
    } catch (err) {
      console.error('Error claiming win:', err)
      error.value = 'Failed to claim win'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function confirmWin(resultId: string) {
    if (!authStore.user?.uid) throw new Error('Must be logged in')

    try {
      loading.value = true
      error.value = null

      // Find an unused code from the pool
      const codesQuery = query(
        collection(db, 'codes'),
        where('isUsed', '==', false)
      )
      const codesSnapshot = await getDocs(codesQuery)

      if (codesSnapshot.empty) {
        throw new Error('No available codes in pool')
      }

      // Pick a random unused code
      const availableCodes = codesSnapshot.docs
      const randomIndex = Math.floor(Math.random() * availableCodes.length)
      const codeDoc = availableCodes[randomIndex]
      const codeData = codeDoc.data()

      // Update the competition result
      await updateDoc(doc(db, 'competition_results', resultId), {
        status: 'confirmed',
        confirmedBy: authStore.user.uid,
        confirmedAt: new Date().toISOString(),
        awardedCode: codeData.code
      })

      // Mark code as used by the claiming team
      const result = pendingAgainstTeam.value.find(r => r.id === resultId)
      if (result) {
        await updateDoc(doc(db, 'codes', codeDoc.id), {
          isUsed: true,
          usedBy: result.claimedBy,
          usedByTeam: result.claimingTeamId,
          usedAt: new Date().toISOString()
        })

        // Add to team's winner codes if it's a winner code
        if (codeData.isWinner) {
          await teamsStore.markTeamAsWinner(result.claimingTeamId, codeData.code)
        }
      }

      return codeData.code
    } catch (err) {
      console.error('Error confirming win:', err)
      error.value = 'Failed to confirm win'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function declineWin(resultId: string) {
    if (!authStore.user?.uid) throw new Error('Must be logged in')

    try {
      loading.value = true
      error.value = null

      await updateDoc(doc(db, 'competition_results', resultId), {
        status: 'declined',
        confirmedBy: authStore.user.uid,
        confirmedAt: new Date().toISOString()
      })
    } catch (err) {
      console.error('Error declining win:', err)
      error.value = 'Failed to decline win'
      throw err
    } finally {
      loading.value = false
    }
  }

  function listenPendingForTeam(teamId: string) {
    if (pendingUnsubscribe) pendingUnsubscribe()

    const q = query(
      collection(db, 'competition_results'),
      where('opponentTeamId', '==', teamId),
      where('status', '==', 'pending')
    )

    pendingUnsubscribe = onSnapshot(q, (snapshot) => {
      pendingAgainstTeam.value = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as CompetitionResult[]
    })
  }

  function listenClaimsForTeam(teamId: string) {
    if (claimsUnsubscribe) claimsUnsubscribe()

    const q = query(
      collection(db, 'competition_results'),
      where('claimingTeamId', '==', teamId)
    )

    claimsUnsubscribe = onSnapshot(q, (snapshot) => {
      teamClaims.value = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as CompetitionResult[]
    })
  }

  function stopListening() {
    if (pendingUnsubscribe) {
      pendingUnsubscribe()
      pendingUnsubscribe = null
    }
    if (claimsUnsubscribe) {
      claimsUnsubscribe()
      claimsUnsubscribe = null
    }
  }

  return {
    pendingAgainstTeam,
    teamClaims,
    loading,
    error,
    claimWin,
    confirmWin,
    declineWin,
    listenPendingForTeam,
    listenClaimsForTeam,
    stopListening
  }
})
