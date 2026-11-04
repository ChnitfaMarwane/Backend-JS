import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyAKbusylt-eCDgrhAruYejWJKXyX6Z_kO4',
  authDomain: 'ensas-615ab.firebaseapp.com',
  projectId: 'ensas-615ab',
  storageBucket: 'ensas-615ab.firebasestorage.app',
  messagingSenderId: '379466635436',
  appId: '1:379466635436:web:14e9156acb14b30317e709',
  measurementId: 'G-EC23CQ4Q5S'
}

const app = initializeApp(firebaseConfig)
getAnalytics(app)

export default app
