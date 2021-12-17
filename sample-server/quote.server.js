const app = document.createElement('div')
app.innerText = 'hello from quote'
document.body.appendChild(app)

const router = {
  init: async (conn, payload) => {
    const code = localStorage.getItem('quote.client.js')
    conn.send({
      type: 'eval',
      code: code
    })
  },
  getQuote: async (conn, payload) => {
    const response = await fetch('https://api.quotable.io/random')
    const responseJson = await response.json()
    conn.send({
      type: 'quote',
      text: responseJson.content,
      author: responseJson.author
    })
  }
}

me.on('connection', (conn) => {
  conn.on('data', async (payload) => {
    const appKey = payload.href.split('/')[3]
    if (appKey != 'quote') return null
    if (router.hasOwnProperty(payload.type)) {
      router[payload.type](conn, payload)
    }
  })
})
