const CITE = require('../citation.js')
const express = require('express')

// Content-type
const CONTENT_TYPE_FORMATS = {
    'application/vnd.citationstyles.csl+json': '@else/json',
    'application/x-cff': '@else/yaml',
    'application/x-bibtex': '@biblatex/text',
    'application/x-research-info-systems': '@ris/file'
}

// Routes
const router = express.Router()

router.post('/', (request, response) => {
    const inputType = CONTENT_TYPE_FORMATS[request.get('content-type')]
    return respond(request.body, inputType, response)
})

router.get('/doi/:input', ({ params: { input } }, response) => {
    let inputType = CITE.getType(input)
    if (!inputType.startsWith('@doi/')) {
        inputType = '@doi/id'
    }
    return respond(input, inputType, response)
})

router.get('/isbn/:input', ({ params: { input } }, response) => {
    let inputType = CITE.getType(input)
    if (!inputType.startsWith('@isbn/')) {
        inputType = '@isbn/isbn-10'
    }
    return respond(input, inputType, response)
})

function respond (input, inputType, response) {
    return CITE.doQuickstatementsExport(input, inputType)
        .then(output => {
            response.set('Content-Type', 'text/plain')
            response.send(output)
        })
        .catch(error => {
            response.sendStatus(error instanceof CITE.CiteError ? error.getHttpStatus() : 500)
        })
}

module.exports = router
