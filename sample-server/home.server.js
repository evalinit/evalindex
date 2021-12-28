const app = document.createElement('div')
app.id = 'home'
app.innerText = 'hello from home'
document.body.appendChild(app)

app.addEventListener('init', (event) => {
  const { evalChannel } = event.detail
  evalChannel.send(localStorage.getItem('home.client.js'))
})
