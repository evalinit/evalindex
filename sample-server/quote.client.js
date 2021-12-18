document.title = 'random quote'

const style = document.createElement('style')

style.innerText = `
  #app {
    background-color: black;
    color: white;
  }
`
document.head.appendChild(style)

document.body.innerHTML = `
  <div id="app">
    <blockquote id="quote"></blockquote>
    <p id="author"></p>
    <button id="newQuoteBtn">Quote Me!</button>
  </div>
`

newQuoteBtn.onclick = () => {
  window.conn.send({
    type: 'getQuote',
    href: window.location.href
  })
}
window.conn.on('data', (payload) => {
  if (payload.type == 'quote') {
    quote.innerText = payload.text
    author.innerText = payload.author
  }
})

window.conn.send({
  type: 'getQuote',
  href: window.location.href
})
