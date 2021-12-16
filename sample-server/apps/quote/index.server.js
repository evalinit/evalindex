conn.on('data', async (payload) => {
  if (payload.type == 'get-new-quote') {
    const response = await fetch('https://api.quotable.io/random')
    const responseJson = await response.json()
    conn.send({
      type: 'quote',
      text: responseJson.content,
      author: responseJson.author
    })
  }
})
