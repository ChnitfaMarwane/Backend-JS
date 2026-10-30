// TP4 - TODO 1 : configurez le routeur.
//
// Trois routes attendues :
//   '/'            -> HomeView   (nom: 'home')
//   '/livre/:id'   -> BookDetailsView (nom: 'book-details')
//   toute autre URL -> NotFoundView (nom: 'not-found')
//
// Indice : import { createRouter, createWebHistory } from 'vue-router'

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BookDetailsView from '../views/BookDetailsView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/livre/:id', name: 'book-details', component: BookDetailsView },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
