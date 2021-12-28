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

quoteChannel = window.conn.createDataChannel('quote')

newQuoteBtn.onclick = () => {
  quoteChannel.send(JSON.stringify({
    type: 'getQuote'
  }))
}

quoteChannel.onmessage = (event) => {
  const payload = JSON.parse(event.data)
  if (payload.type == 'quote') {
    quote.innerText = payload.text
    author.innerText = payload.author
  }
}

quoteChannel.onopen = () => {
  quoteChannel.send(JSON.stringify({
    type: 'getQuote'
  }))
}
