window.addEventListener('connection', (event) => {
  const { conn } = event.detail
  console.log(conn)

  let evalChannel
  conn.addEventListener('datachannel', (event) => {
    console.log(event)
    switch (event.channel.label) {
      case 'eval':
        evalChannel = event.channel
        evalChannel.addEventListener('open', () => {
          evalChannel.send(localStorage.getItem('init.client.js'))
        })
        break
      case 'init':
        event.channel.addEventListener('open', () => {
          event.channel.onmessage = (event) => {
            const { href } = JSON.parse(event.data)
            const appKey = href.split('/')[3] || 'home'
            const app = document.getElementById(appKey)
            if (app) {
              const dataEvent = new CustomEvent('init', {
                detail: {
                  conn: conn,
                  evalChannel: evalChannel
                }
              })
              app.dispatchEvent(dataEvent)
            }
          }
        })
        break
    }
  })
})
