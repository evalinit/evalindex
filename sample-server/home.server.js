const app = document.createElement('div')
app.innerText = 'hello from home'
document.body.appendChild(app)

me.on('connection', (conn) => {
  conn.on('data', (payload) => {
    const appKey = payload.href.split('/')[3]
    if (appKey) return null
    if (payload.type == 'init') {
      const code = localStorage.getItem(`home.client.js`)
      conn.send({
        type: 'eval',
        code: code
      })
    }
  })
})
