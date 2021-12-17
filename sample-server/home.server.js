const app = document.createElement('div')
app.id = 'home'
app.innerText = 'hello from home'
document.body.appendChild(app)

app.addEventListener('data', (event) => {
  const {conn} = event.detail
  const code = localStorage.getItem(`home.client.js`)
  conn.send({
    type: 'eval',
    code: code
  })
})
