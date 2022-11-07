const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.static('build'))
app.use(cors())
app.use(express.json())

app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}))

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-571251"
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "040-535251"
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "040-527521"
  }
]


app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people </p> ${Date()}`)
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }
  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }
  const names = persons.map(person => person.name)
  if (names.includes(body.name)) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const person = {
    id: Math.floor(Math.random() *100),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  response.json(person)
})


app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

const port = process.env.PORT || "8080"