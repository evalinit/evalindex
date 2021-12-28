const app = document.createElement('div')
app.id = 'quote'
app.innerText = 'hello from quote'
document.body.appendChild(app)

const router = {
  getQuote: async (channel, payload) => {
    const response = await fetch('https://api.quotable.io/random')
    const responseJson = await response.json()
    channel.send(JSON.stringify({
      type: 'quote',
      text: responseJson.content,
      author: responseJson.author
    }))
  }
}

app.addEventListener('init', (event) => {
  const { conn, evalChannel } = event.detail
  conn.addEventListener('datachannel', (event) => {
    if (event.channel.label == 'quote') {
      event.channel.onmessage = (message) => {
        console.log(message)
        const payload = JSON.parse(message.data)
        if (router.hasOwnProperty(payload.type)) {
          router[payload.type](event.channel, payload)
        }
      }
    }
  })
  evalChannel.send(localStorage.getItem('quote.client.js'))
})
