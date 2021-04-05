import firebase from 'firebase/app'
import 'firebase/functions'

const region = 'europe-west2'
const config = {
  projectId: 'mdinos-net',
}

if (!firebase.apps.length) {
  firebase.initializeApp(config)
}
const myApp = firebase.app()
const functions = myApp.functions(region)

export { functions, firebase }