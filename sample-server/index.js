for (const key in localStorage) {
  if (key.endsWith('server.js')) {
    eval(localStorage.getItem(key))
  }
}
