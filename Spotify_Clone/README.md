# Spotify Clone

Application de démonstration construite avec Vue 3 et Vite, utilisant l’API Spotify.

## Configuration Spotify

Chaque utilisateur doit créer sa propre application dans le [tableau de bord Spotify for Developers](https://developer.spotify.com/dashboard) et utiliser ses propres identifiants. Les identifiants Spotify du propriétaire du projet ne sont pas fournis dans le dépôt.

Pour lancer l’application en local :

1. Créez une application dans Spotify for Developers et récupérez son **Client ID** et son **Client Secret**.
2. À la racine du dossier `Spotify_Clone`, copiez `.env.example` vers `.env` et renseignez vos identifiants :

   ```env
   VITE_SPOTIFY_CLIENT_ID=votre_client_id
   VITE_SPOTIFY_CLIENT_SECRET=votre_client_secret
   ```

   Vous pouvez aussi saisir vos identifiants dans le formulaire de connexion Spotify de l’application.
3. Installez les dépendances et démarrez le serveur :

   ```sh
   npm install
   npm run dev
   ```

Le fichier `.env` est ignoré par Git : ne publiez jamais vos identifiants dans GitHub, dans le code source ou dans une capture d’écran. Si un secret a été publié, révoquez-le et créez-en un nouveau depuis le tableau de bord Spotify.

> **Sécurité :** cette application de démonstration appelle Spotify directement depuis le navigateur. Les variables Vite préfixées par `VITE_` et tout secret saisi dans l’application peuvent être visibles côté client. N’utilisez pas de véritable Client Secret dans une application déployée publiquement ; pour la production, effectuez l’authentification côté serveur ou utilisez un flux OAuth adapté aux applications publiques, comme Authorization Code avec PKCE.