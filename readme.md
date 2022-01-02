**Peer to peer web applications hosted in the browser**

[evalindex.com](https://evalindex.com)

[index.html](/static/html/index.html) executes whatever code is stored at the localStorage key index.js

This site has two types of users: servers and their clients. Servers access at {namespace}.server.evalindex.com. Clients access at {namespace}.evalindex.com

Whenever a client opens a tab at a namespace, a peer to peer connection is brokered between the client and the first server tab authenticated at that namespace to respond

Servers can listen for the connection/datachannel events to ensure the eval channel is open before sending any code to be executed

```
window.addEventListener('connection', (event) => {
  const { conn } = event.detail
  conn.addEventListener('datachannel', (event) => {
    switch (event.channel.label) {
      case 'eval':
        event.channel.addEventListener('open', () => {
          event.channel.send('alert("hello, world")')
        })
        break
    }   
  })
})
```
Pull requests for [namespaces](/hashes) are more than welcome, but you can try it out locally

1. docker-compose up
2. open example.server.localhost:8000
3. paste the above code into the localStorage key index.js
4. open example.localhost:8000

See [/sample-server](/sample-server) for more examples
