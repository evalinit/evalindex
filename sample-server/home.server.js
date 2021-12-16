const app = document.createElement('div')
app.innerText = 'hello from home'
document.body.appendChild(app)

me.on('connection', (conn) => {
  const code = localStorage.getItem('home.client.js')
  console.log(conn)
  console.log(code)
  setTimeout(()=> {
    conn.send({
      type: 'eval',
      code: code
    })
  }, 100)
})
