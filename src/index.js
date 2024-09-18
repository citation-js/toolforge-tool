const path = require('path')
const Cite = require('@citation-js/core')
const express = require('express')
const cors = require('cors')
const swagger = require('swagger-ui-dist').absolutePath()
const OpenApiValidator = require('express-openapi-validator')
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
apiRouter.use('/quickstatements', express.text({ type: '*/*' }))
apiRouter.use(OpenApiValidator.middleware({ apiSpec: path.join(__dirname, '../assets/openapi.yaml') }))
apiRouter.use(cors())
apiRouter.use('/export', require('./routes/export.js'))
apiRouter.use('/quickstatements', require('./routes/quickstatements.js'))
app.use('/api/v1', apiRouter)
app.use((err, req, res, next) => {
  res.status(err.status || 500).send(err.message)
})

// Pages
app.get('/', (_, res) => { res.render('index') })
app.get('/openapi', (_, res) => { res.render('openapi') })
app.get('/export', (req, res) => {
  res.render('export', {
    id: req.query.id
  })
})

// Static
app.use('/assets', express.static('assets'))
app.use('/openapi', express.static(swagger))

// LISTEN
// ======
const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Running Citation.js v${Cite.version} on http://localhost:${PORT}...`))
