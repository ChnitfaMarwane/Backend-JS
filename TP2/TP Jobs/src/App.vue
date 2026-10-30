<template>
  <header class="site-header">
    <div class="header-content">
      <RouterLink class="brand" to="/">emplois<span>.</span></RouterLink>
      <RouterLink class="button button-primary header-button" to="/add">
        + Publier une offre
      </RouterLink>
    </div>
  </header>
  <main class="page-content">
    <RouterView />
  </main>
  <footer class="site-footer">Une sélection d’offres pour la suite de votre parcours.</footer>
</template>
