const fs = require('fs')
const path = require('path')

const Cite = require('@citation-js/core')
require('@citation-js/plugin-bibtex')
require('@citation-js/plugin-csl')
require('@citation-js/plugin-ris')
require('@citation-js/plugin-wikidata')

// Disable URL requests
Cite.plugins.input.removeDataParser('@else/url', true)
Cite.plugins.input.removeDataParser('@else/url', false)

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
const ERROR = {
  UNKNOWN: 0,
  INPUT_INVALID: 1,
  OUTPUT_INVALID: 2,
}

// Functions
const EXPORT_INPUT_TYPES = new Set(['@wikidata/id', '@wikidata/list+text'])
async function doExport (input, format, options) {
    if (!Cite.plugins.output.has(format)) {
        throw ERROR.OUTPUT_INVALID
    }

    const inputType = Cite.plugins.input.type(input)
    if (!EXPORT_INPUT_TYPES.has(inputType)) {
        throw ERROR.INPUT_INVALID
    }

    try {
        const data = await Cite.Cite.async(input, { generateGraph: false })
        await prepareFormatting(format, options)
        return data.format(format, options)
    } catch (e) {
        console.log(e)
        throw ERROR.UNKNOWN
    }
}

module.exports = { doExport, ERROR }
