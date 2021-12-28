console.log(window.conn)
const routerChannel = window.conn.createDataChannel('init')
routerChannel.onopen = () => {
  routerChannel.send(JSON.stringify({
    href: window.location.href
  }))
}
