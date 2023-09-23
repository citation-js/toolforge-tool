const Cite = require('@citation-js/core')
const express = require('express')
const app = express()

// SETUP
// =====
app.use(express.text())
app.use(express.json({ limit: '250kb' }))
app.set('views', './views')
app.set('view engine', 'pug')

// ROUTES
// ======

// API
const apiRouter = express.Router()
apiRouter.use('/export', require('./routes/export.js'))
app.use('/api/v1', apiRouter)

// Pages
app.get('/', (_, res) => { res.render('index') })

// Static
app.use('/assets', express.static('assets'))

// LISTEN
// ======
const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Running Citation.js v${Cite.version} on http://localhost:${PORT}...`))
