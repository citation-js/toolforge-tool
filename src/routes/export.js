const fs = require('fs')
const path = require('path')

const CITE = require('../citation.js')
const express = require('express')

// Option parsing
const OPTION_TYPES = {
    bibliography: {
        asEntryArray: 'boolean',
        nosort: 'boolean',
        entry: 'json'
    },
    citation: {
        entry: 'json'
    }
}

function parseValue (value, type) {
    if (type === 'boolean') {
        return value === 'true'
    } else if (type === 'json') {
        try {
            return JSON.parse(value)
        } catch (e) {
            return value
        }
    } else {
        return value
    }
}

function addOption (options, [key, ...path], value) {
    if (path.length === 0) {
        options[key] = value
    } else if (key in options) {
        addOption(options[key], path, value)
    } else {
        addOption(options[key] = {}, path, value)
    }
}

function createOptions (query, format) {
    const optionTypes = OPTION_TYPES[format] || {}
    const options = {}
    for (const param in query) {
        const path = param.split('.')
        const value = parseValue(query[param], optionTypes[param] || 'string')
        addOption(options, path, value)
    }
    return options
}

// Content-type
const FORMAT_CSL = {
    csljson: 'data',
    cslndjson: 'ndjson'
}
const FORMAT_CONTENT_TYPES = {
    data: 'application/vnd.citationstyles.csl+json',
    ndjson: 'application/x-ndjson',
    bibtex: 'application/x-bibtex',
    biblatex: 'application/x-bibtex',
    bibtxt: 'text/plain',
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
        if (options.asEntryArray) {
            return 'application/json'
        }

        return CSL_FORMAT_CONTENT_TYPES[options.format] || CSL_FORMAT_CONTENT_TYPES.html
    }
    return FORMAT_CONTENT_TYPES[format]
}

// Routes
const router = express.Router()
router.get('/:input/:format', ({ params: { input, format }, query }, response) => {
    if (format in FORMAT_CSL) {
        format = FORMAT_CSL[format]
    }

    const options = createOptions(query, format)
    return CITE.doExport(input, format, options)
        .then(output => {
            response.set('Content-Type', getContentType(format, options))
            response.send(output)
        })
        .catch(error => {
            if (error instanceof CITE.CiteError) {
                response.status(error.getHttpStatus())
                response.send(error.message)
            } else {
                response.sendStatus(500)
            }
        })
})

module.exports = router
