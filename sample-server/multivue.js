(async function () {
  async function loadKey(key) {
    gval(localStorage.getItem(key))
  }
  async function loadFile(link) {
    let element
    if (link.endsWith('.css')) {
      element = document.createElement('link')
      element.rel = 'stylesheet'
      element.href = link
    } else if (link.endsWith('.js')) {
      element = document.createElement('script')
      element.src = link
    }
    document.head.appendChild(element)
    return new Promise((resolve, reject) => {
      element.onload = () => {
        resolve()
      }
    })
  }
  await Promise.all([
    loadFile('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.0/codemirror.min.js'),
    loadFile('https://unpkg.com/vue@2.6.14/dist/vue.min.js'),
    loadKey('logger.js')
  ])

  await Promise.all([
    loadFile('https://unpkg.com/buefy@0.9.14/dist/buefy.min.css'),
    loadFile('https://unpkg.com/buefy@0.9.14/dist/buefy.min.js'),
    loadFile('https://unpkg.com/underscore@1.13.2/underscore-umd-min.js'),
    loadFile('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.0/codemirror.min.css'),
    loadFile('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.0/mode/javascript/javascript.min.js'),
    loadFile('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.0/addon/selection/active-line.min.js'),
    loadFile('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.0/mode/css/css.min.js'),
    loadFile('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.0/mode/htmlmixed/htmlmixed.min.js'),
    loadFile('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.0/mode/xml/xml.min.js')
  ])
  document.title = 'Dashboard'
  document.body.style.height = '100%'
  document.documentElement.style.height = '100%'
  const viewportMeta = document.createElement('meta')
  viewportMeta.name = 'viewport'
  viewportMeta.content = 'width=device-width, initial-scale=1'
  document.head.appendChild(viewportMeta)
  document.body.innerHTML = `
    <div id="os">
      <div class="tile is-anscestor">
        <div v-for="app in apps" class="tile is-parent is-6">
          <div v-bind:id="app" class="tile is-child box">
            <widget />
          </div>
        </div>
      </div>
    </div>
  `
  const app = new Vue({
    el: '#os',
    data: {
      apps: []
    },
    created () {
      this.launchApp('editor')
    },
    methods: {
      launchApp(key) {
        const widgetObject = new Function(localStorage.getItem(key + '.factory.js'))()
        if (widgetObject.constructor.name == 'Object') {
          this.apps.push(key)
          this.$nextTick(() => {
            new Vue({
              el: '#' + key,
              components: {
                widget: widgetObject
              }
            })
          })
        }
      }
    }
  })
})()
