const fs = require('fs')
const path = require('path')

const Cite = require('@citation-js/core')
require('@citation-js/plugin-bibtex')
require('@citation-js/plugin-cff')
require('@citation-js/plugin-csl')
require('@citation-js/plugin-doi')
require('@citation-js/plugin-isbn')
require('@citation-js/plugin-quickstatements')
require('@citation-js/plugin-ris')
require('@citation-js/plugin-wikidata')

// Dynamically load styles
const STYLES_DIR = path.resolve(__dirname, '../../styles')
const { templates: styles } = Cite.plugins.config.get('@csl')

async function prepareFormatting (format, { template: style }) {
    if ((format !== 'citation' && format !== 'bibliography') || !style) {
        return
    }

    if (styles.has(style)) {
        return
    }

    const stylePath = path.resolve(STYLES_DIR, style + '.csl')

    if (path.dirname(stylePath) !== STYLES_DIR || !fs.existsSync(stylePath)) {
        return
    }

    styles.add(style, await fs.promises.readFile(stylePath, 'utf8'))
}

// Errors
class CiteError extends Error {
    constructor (message, options) {
        super(message, options)
        this.code = options.code
    }

    getHttpStatus () {
        switch (this.code) {
            case CiteError.ERROR_INPUT_INVALID: return 415; // Not Acceptable
            case CiteError.ERROR_OUTPUT_INVALID: return 406; // Unsupported Media Type
            case CiteError.ERROR_UNKNOWN: return 500; // Internal Server Error
            default: return 500; // Internal Server Error
        }
        return ERROR_STATUSES[this.code] || 500
    }
}

CiteError.ERROR_UNKNOWN = 0
CiteError.ERROR_INPUT_INVALID = 1
CiteError.ERROR_OUTPUT_INVALID = 2

// Functions
const EXPORT_INPUT_TYPES = new Set(['@wikidata/id', '@wikidata/list+text'])
async function doExport (input, format, options) {
    if (!Cite.plugins.output.has(format)) {
        throw CiteError.ERROR_OUTPUT_INVALID
    }

    const inputType = Cite.plugins.input.type(input)
    if (!EXPORT_INPUT_TYPES.has(inputType)) {
        throw CiteError.ERROR_INPUT_INVALID
    }

    try {
        const data = await Cite.Cite.async(input, { generateGraph: false })
        await prepareFormatting(format, options)
        return data.format(format, options)
    } catch (e) {
        throw new CiteError('Export failed', { code: CiteError.ERROR_UNKNOWN })
    }
}

async function doQuickstatementsExport (input, inputType) {
    try {
        const data = await Cite.Cite.async(input, {
            forceType: inputType,
            generateGraph: false
        })
        return data.format('quickstatements')
    } catch (e) {
        console.error(e, input)
        throw new CiteError('Export failed', { code: CiteError.ERROR_UNKNOWN })
    }
}

module.exports = {
    getType: input => Cite.plugins.input.type(input),
    doExport,
    doQuickstatementsExport,
    CiteError
}
