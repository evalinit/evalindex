document.body.style.margin = '0'
document.body.style.height = '100%'
document.documentElement.style.height = '100%'

document.body.innerHTML = `
  <iframe width="100%" height="100%" src="//jsfiddle.net/${localStorage.getItem('firstFiddle')}/embedded/js,html,css,result/dark/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>
`

const listenForChildDocument = (event) => {
  if (event.data.type == 'launchFiddle') {
    window.removeEventListener('message', listenForChildDocument)
    document.write(event.data.document)
  }
}

window.addEventListener('message', listenForChildDocument)
