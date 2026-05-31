import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuthStore } from './auth'
import { useTeamsStore } from './teams'

interface Code {
  id: string
  code: string
  isWinner: boolean
  isUsed: boolean
  usedBy?: string
  usedByTeam?: string
  usedAt?: string
  createdAt: string
  createdBy: string
}

export const useCodesStore = defineStore('codes', () => {
  const authStore = useAuthStore()
  const teamsStore = useTeamsStore()
  const codes = ref<Code[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadCodes() {
    if (!authStore.isAdmin) return
    
    try {
      loading.value = true
      error.value = null
      
      const codesQuery = collection(db, 'codes')
      const querySnapshot = await getDocs(codesQuery)
      
      codes.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Code[]
    } catch (err) {
      console.error('Error loading codes:', err)
      error.value = 'Failed to load codes'
    } finally {
      loading.value = false
    }
  }

  async function generateCodes(count: number, winnerCount: number) {
    if (!authStore.isAdmin) {
      throw new Error('Only admins can generate codes')
    }
    
    try {
      loading.value = true
      error.value = null
      
      const newCodes: Omit<Code, 'id'>[] = []
      
      // Generate unique codes
      for (let i = 0; i < count; i++) {
        const code = generateUniqueCode()
        newCodes.push({
          code,
          isWinner: i < winnerCount,
          isUsed: false,
          createdAt: new Date().toISOString(),
          createdBy: authStore.user!.uid
        })
      }
      
      // Shuffle to randomize winner codes
      for (let i = newCodes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newCodes[i], newCodes[j]] = [newCodes[j], newCodes[i]]
      }
      
      // Save to Firestore
      const batch = []
      for (const codeData of newCodes) {
        batch.push(addDoc(collection(db, 'codes'), codeData))
      }
      
      await Promise.all(batch)
      await loadCodes()
    } catch (err) {
      console.error('Error generating codes:', err)
      error.value = 'Failed to generate codes'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function validateCode(code: string): Promise<{ isValid: boolean; isWinner: boolean; message: string }> {
    try {
      loading.value = true
      error.value = null
      
      // Find the code
      const codeQuery = query(
        collection(db, 'codes'),
        where('code', '==', code)
      )
      
      const querySnapshot = await getDocs(codeQuery)
      
      if (querySnapshot.empty) {
        return { isValid: false, isWinner: false, message: 'Invalid code' }
      }
      
      const codeDoc = querySnapshot.docs[0]
      const codeData = codeDoc.data() as Code
      
      if (codeData.isUsed) {
        return { isValid: false, isWinner: false, message: 'Code has already been used' }
      }
      
      // Mark code as used
      await updateDoc(doc(db, 'codes', codeDoc.id), {
        isUsed: true,
        usedBy: authStore.user!.uid,
        usedByTeam: teamsStore.currentTeam?.id,
        usedAt: new Date().toISOString()
      })
      
      // If it's a winning code, mark the team as winner
      if (codeData.isWinner && teamsStore.currentTeam) {
        await teamsStore.markTeamAsWinner(teamsStore.currentTeam.id, code)
      }
      
      return {
        isValid: true,
        isWinner: codeData.isWinner,
        message: codeData.isWinner ? 'Congratulations! You won!' : 'Sorry, try again!'
      }
    } catch (err) {
      console.error('Error validating code:', err)
      error.value = 'Failed to validate code'
      return { isValid: false, isWinner: false, message: 'Error validating code' }
    } finally {
      loading.value = false
    }
  }

  function generateUniqueCode(): string {
    const num = Math.floor(Math.random() * 10000)
    return num.toString().padStart(4, '0')
  }

  async function updateCode(codeId: string, newCode: string, isWinner: boolean) {
    if (!authStore.isAdmin) {
      throw new Error('Only admins can update codes')
    }
    
    try {
      loading.value = true
      error.value = null
      
      await updateDoc(doc(db, 'codes', codeId), {
        code: newCode,
        isWinner,
        updatedAt: new Date().toISOString()
      })
      
      await loadCodes()
    } catch (err) {
      console.error('Error updating code:', err)
      error.value = 'Failed to update code'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCode(codeId: string) {
    if (!authStore.isAdmin) {
      throw new Error('Only admins can delete codes')
    }
    
    try {
      loading.value = true
      error.value = null
      
      await deleteDoc(doc(db, 'codes', codeId))
      await loadCodes()
    } catch (err) {
      console.error('Error deleting code:', err)
      error.value = 'Failed to delete code'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAllCodes() {
    if (!authStore.isAdmin) {
      throw new Error('Only admins can delete codes')
    }

    try {
      loading.value = true
      error.value = null

      const codesQuery = collection(db, 'codes')
      const querySnapshot = await getDocs(codesQuery)

      const batch = querySnapshot.docs.map(d => deleteDoc(doc(db, 'codes', d.id)))
      await Promise.all(batch)

      codes.value = []
    } catch (err) {
      console.error('Error deleting all codes:', err)
      error.value = 'Failed to delete all codes'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    codes,
    loading,
    error,
    loadCodes,
    generateCodes,
    validateCode,
    updateCode,
    deleteCode,
    deleteAllCodes
  }
})