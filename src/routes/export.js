const CITE = require('../citation.js')
const express = require('express')

// Option parsing
function addOption (options, [key, ...path], value) {
    if (path.length === 0) {
        options[key] = value
    } else if (key in options) {
        addOption(options[key], path, value)
    } else {
        addOption(options[key] = {}, path, value)
    }
}

function createOptions (query) {
    const options = {}
    for (const param in query) {
        const path = param.split('.')
        addOption(options, path, query[param])
    }
    return options
}

// Error handling
const ERROR_STATUSES = {
    [CITE.ERROR.INPUT_INVALID]: 415, // Not Acceptable
    [CITE.ERROR.OUTPUT_INVALID]: 406, // Unsupported Media Type
    [CITE.ERROR.UNKNOWN]: 500, // Internal Server Error
}

// Content-type
const FORMAT_CONTENT_TYPES = {
    data: 'application/vnd.citationstyles.csl+json',
    ndjson: 'application/x-ndjson',
    bibtex: 'application/x-bibtex',
    biblatex: 'application/x-bibtex',
    bibtxt: 'application/plain',
    ris: 'application/x-research-info-systems'
}
const CSL_FORMAT_CONTENT_TYPES = {
    html: 'text/html',
    text: 'text/plain',
    rtf: 'text/rtf',
    latex: 'application/x-latex'
}
function getContentType (format, options) {
    if (format === 'bibliography' || format === 'citation') {
        return CSL_FORMAT_CONTENT_TYPES[options.format || 'html']
    }
    return FORMAT_CONTENT_TYPES[format]
}

// Routes
const router = express.Router()
router.get('/:input/:format', ({ params: { input, format }, query }, response) => {
    const options = createOptions(query)
    return CITE.doExport(input, format, options)
        .then(output => {
            response.set('Content-Type', getContentType(format, options))
            response.send(output)
        })
        .catch(error => {
            response.sendStatus(ERROR_STATUSES[error] || 500)
        })
})

module.exports = router
