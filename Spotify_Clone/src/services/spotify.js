const SPOTIFY_ACCOUNTS_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'

async function getErrorMessage(response) {
  const responseText = await response.text()
  if (!responseText) return response.statusText || 'Unknown error'

  try {
    const body = JSON.parse(responseText)
    return body.error?.message || body.error_description || body.message || responseText
  } catch {
    return responseText
  }
}

async function assertSuccessful(response, operation) {
  if (!response.ok) {
    const detail = await getErrorMessage(response)
    throw new Error(`Spotify ${operation} failed (${response.status}): ${detail}`)
  }
}

export async function getSpotifyToken(clientId, clientSecret) {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  })

  const response = await fetch(SPOTIFY_ACCOUNTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })
  await assertSuccessful(response, 'token request')

  const data = await response.json()
  if (typeof data.access_token !== 'string' || !data.access_token) {
    throw new Error('Spotify token response did not contain an access token.')
  }

  return data.access_token
}

export async function searchTracks(token, query = 'top hits') {
  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: '10'
  })
  const response = await fetch(`${SPOTIFY_API_URL}/search?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  await assertSuccessful(response, 'track search')

  const data = await response.json()
  if (!Array.isArray(data.tracks?.items)) {
    throw new Error('Spotify search response did not contain a track list.')
  }

  return data.tracks.items
}
