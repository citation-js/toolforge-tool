window.addEventListener('load', function () {
  for (const form of document.querySelectorAll('form[data-action]')) {
    form.addEventListener('submit', function (event) {
      event.preventDefault()

      const data = new FormData(form)
      const action = form
        .getAttribute('data-action')
        .replace(/\{(.*?)\}/g, (_, key) => {
          const value = data.get(key)
          data.delete(key)
          return value
        })
      const query = [...data.entries()].map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value)).join('&')

      const output = form.querySelector('#output')
      fetch(action + '?' + query).then(function (response) {
        const contentType = response.headers.get('content-type')
        response.text().then(function (text) {
          if (contentType.match(/^text\/html(;|$)/)) {
            output.innerHTML = text
          } else {
            const pre = document.createElement('pre')
            pre.setAttribute('style', 'overflow: visible;')
            pre.textContent = text
            output.innerHTML = ''
            output.append(pre)
          }
        })
      })
    })
  }
})
