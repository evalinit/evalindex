const app = document.createElement('div')
app.innerText = 'hello from home'
document.body.appendChild(app)

me.on('connection', (conn) => {
  conn.on('data', (payload) => {
    if (payload.type == 'init') {
      const appKey = payload.href.split('/')[3] || 'home'
      const code = localStorage.getItem(`${appKey}.client.js`)
      conn.send({
        type: 'eval',
        code: code
      })
    }
  })
})
