document.addEventListener('DOMContentLoaded', () => {
	init()
})

async function callHelloWorld(functions) {
	functions.httpsCallable('helloWorld-main')()
	.then((res) => { 
		console.log("Called API successfully")
		console.log(res.data.payload)
	})
	.catch((error) => {
		console.log(error)
	})
}

async function init() {
	try {
		var app = firebase.initializeApp({
			projectId: 'mdinos-net'
		})
		//var app = await firebase.app()
		console.log('Initialised App')
		var functions = app.functions('europe-west2')
		console.log('Initialised Functions')
  	} catch (e) {
    	console.error(e)
    	console.log('Error loading the Firebase SDK, check the console.')
  	}
	
	callHelloWorld(functions) 
}