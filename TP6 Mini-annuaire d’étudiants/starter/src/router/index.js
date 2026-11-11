import { createRouter, createWebHistory } from 'vue-router'
import NotFoundView from '../views/NotFoundView.vue'
import StudentDetailView from '../views/StudentDetailView.vue'
import StudentListView from '../views/StudentListView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: StudentListView },
    { path: '/etudiant/:id', component: StudentDetailView },
    { path: '/:pathMatch(.*)*', component: NotFoundView }
  ]
})

export default router
