require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person') 
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

app.get('/info', (req, res) => {
  Person.find({}).then(persons => {
    res.send(`<p>Phonebook has info for ${persons.length} people </p> ${Date()}`)})
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (body.content === undefined) {
    return res.status(400).json({ error: 'content missing' })
  }
  const person = new Person({
    name: body.name,
    number: body.number
  })
  person.save()
  .then(savedPerson => {
    res.json(savedPerson)
  })
  .catch(error => next(error) )
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
}) 

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
  .then(() => {
    res.status(204).end()
  })
  .catch(error => next(error) )
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const person = {
    name: body.name,
    number: body.number,
  }
Person.findByIdAndUpdate(req.params.id, person, { new: true })
  .then(updated => {
    res.json(updated)
  })
  .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
