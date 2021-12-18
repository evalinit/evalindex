for (const key in localStorage) {
  if (key.endsWith('server.js')) {
    eval(localStorage.getItem(key))
  }
}

window.me.on('connection', (conn) => {
  conn.on('data', async (payload) => {
    const appKey = payload.href.split('/')[3] || 'home'
    const app = document.getElementById(appKey)
    if (app) {
      const dataEvent = new CustomEvent('data', {
        detail: {
          conn: conn,
          payload: payload
        }
      })
      app.dispatchEvent(dataEvent)
    }
  })
})
