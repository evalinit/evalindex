document.body.style.height = '100%'
document.documentElement.style.height = '100%'

document.body.innerHTML = `
  <iframe width="100%" height="100%" src="//jsfiddle.net/evalinit/5h6quy37/embedded/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>
`

window.addEventListener('message', function (evt) {
  console.log(evt)
  if (evt.data.type == 'launchFiddle') {
    document.write(evt.data.document)
    window.removeEventListener('message', this)
  }
})
