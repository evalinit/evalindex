for (const key in localStorage) {
  if (key.endsWith('server.js')) {
    gval(localStorage.getItem(key))
  }
}
