newQuoteBtn.onclick = () => {
  conn.send({
    type: 'get-new-quote'
  })
}
console.log(conn)
conn.on('data', (payload) => {
  if (payload.type == 'quote') {
    quote.innerText = payload.text
    author.innerText = payload.author
  }
})
