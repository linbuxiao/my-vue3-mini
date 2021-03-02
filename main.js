import { createApp } from './lib/createApp.js'
// import App from './App.js'
import SetupApp from './SetupApp.js'


const container = document.getElementById('root')
createApp(SetupApp).mount(container)