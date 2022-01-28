const coder = {
  template: `
    <textarea ref="textarea"></textarea>
  `,
  props: ['code', 'mode'],
  data () {
    return {
      workingCode: '',
      codemirror: null
    }
  },
  created () {
    this.workingCode = this.code
  },
  mounted () {
    this.codemirror = CodeMirror.fromTextArea(this.$refs.textarea, {
      tabSize: 2,
      lineNumbers: true,
      line: true,
    })

    this.codemirror.setSize('auto', 'auto')

    // Supports two-way binding
    this.codemirror.on('change', (cm) => {
      this.workingCode = cm.getValue()
      this.$emit('editor-code-changed', this.workingCode)
    })

  },
  watch: {
    code (newVal) {
      this.codemirror.setValue(newVal)
    },
    mode (newVal) {
      this.codemirror.setOption('mode', newVal)
    }
  }
}


const template =  localStorage.getItem('editor.template.html')

const styles = {
  fullHeight: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '100%',
    backgroundColor: 'red'
  },
  toolBar: {
    height: '50px'
  },
  grower: {
    flex: 1,
    overflow: 'scroll'
  }
}

return {
  components: {
    coder: coder
  },
  template: template,
  data () {
    return {
      modalIsOpen: false,
      localStorageKeys: [],
      sessionStorageKeys: [],
      contentFromStorage: '',
      contentFromCoder: '',
      modeFromStorage: {},
      key: '',
      storage: 'local',
      coder: null,
      styles: styles
    }
  },
  created () {
    'editor app created'
  },
  methods: {
    openModal() {
      this.localStorageKeys = _.sortBy(Object.keys(localStorage))
      this.sessionStorageKeys = _.sortBy(Object.keys(sessionStorage))
      this.modalIsOpen = true
    },
    closeModal() {
      this.modalIsOpen = false
    },
    openKey(key, storage) {
      this.storage = storage
      this.key = key
      this.contentFromStorage = this.store.getItem(key)
      this.modeFromStorage = this.getMode(key)
    },
    getMode(key) {
      const splitKey = key.split('.')
      const extension = splitKey[splitKey.length - 1]
      console.log(extension)
      switch (extension) {
        case 'js':
          return {
            name: 'javascript',
            json: true
          }
        case 'html':
          return 'htmlmixed'
        case 'css':
          return 'css'
      }
      return 'null'
    },
    save () {
      console.log('storing')
      this.store.setItem(this.key, this.contentFromCoder)
    },
    updateContent (text) {
      this.contentFromCoder = text
    }
  },
  computed: {
    store () {
      let store = localStorage
      if (this.storage == 'session') {
        store = sessionStorage
      }
      return store
    }
  }
}
