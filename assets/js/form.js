window.addEventListener('load', function () {
  for (const form of document.querySelectorAll('form[action]')) {
    form.addEventListener('submit', function () {
      const data = new FormData(form)
      const action = form
        .getAttribute('action')
        .replace(/\{(.*?)\}/g, (_, key) => {
          form.elements[key].setAttribute('disabled', 'disabled')
          return data.get(key)
        })
      form.setAttribute('action', action)
    })
  }
})
