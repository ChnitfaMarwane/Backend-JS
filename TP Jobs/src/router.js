import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import JobDetailsView from './views/JobDetailsView.vue'
import JobFormView from './views/JobFormView.vue'
import NotFoundView from './views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/add', name: 'add-job', component: JobFormView },
    { path: '/jobs/:id', name: 'job-details', component: JobDetailsView },
    { path: '/jobs/:id/edit', name: 'edit-job', component: JobFormView },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
