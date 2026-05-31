import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TeamSpace from '../views/TeamSpace.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import UserSettings from '../views/UserSettings.vue'
import { useAuthStore } from '../stores/auth'
import { useTeamsStore } from '../stores/teams'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/team',
      name: 'team',
      component: TeamSpace,
      meta: { requiresAuth: true }
    },
    {
      path: '/team/:teamId',
      name: 'team-detail',
      component: TeamSpace,
      meta: { requiresAuth: true }
    },
    {
      path: '/team/join/:teamId',
      name: 'team-join',
      component: TeamSpace,
      meta: { requiresAuth: true },
      beforeEnter: async (to, from, next) => {
        const authStore = useAuthStore()
        const teamsStore = useTeamsStore()
        
        if (!authStore.isAuthenticated) {
          // Store the intended destination
          authStore.setIntendedDestination(to.fullPath)
          // Show the login modal
          authStore.showLoginModal = true
          next('/')
          return
        }

        try {
          const teamId = to.params.teamId as string
          // Check if team exists
          const teamDoc = await getDoc(doc(db, 'teams', teamId))
          if (!teamDoc.exists()) {
            // Team doesn't exist, show error and redirect
            next({ name: 'team', query: { error: 'team_not_found' } })
            return
          }

          // Check if user is already a member
          const teamData = teamDoc.data()
          if (teamData.members?.[authStore.user?.uid || '']) {
            // User is already a member, redirect to team space
            next({ name: 'team-detail', params: { teamId } })
            return
          }

          // User is not a member, proceed to join
          await teamsStore.joinTeam(teamId)
          next({ name: 'team-detail', params: { teamId } })
        } catch (error) {
          console.error('Error checking team:', error)
          next({ name: 'team', query: { error: 'join_failed' } })
        }
      }
    },
    {
      path: '/team-space/:teamId',
      name: 'team-space',
      component: TeamSpace,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboard,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: UserSettings,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Store the intended destination
    authStore.setIntendedDestination(to.fullPath)
    // Show the login modal
    authStore.showLoginModal = true
    // Redirect to home
    next('/')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router
