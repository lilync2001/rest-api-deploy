const express = require('express')
const movies = require('./movie.json')
const crypto = require('node:crypto')
const { validateMovie, validatePartialMovie } = require('./schemas/movie')
const cors=require('cors')

const app = express()
app.disable('x-powered-by')
app.use(express.json())
app.use(cors()) // es un middleware



//todos los recursos que sean moovies se indentifican como /movies
app.get('/movies', (req,res)=>{
    const{genre}= req.query
    if(genre){
    const filterMovies = movies.filter(
        movie=> movie.genre.some(g=>g.toLowerCase()== genre.toLowerCase())
    )
    return res.json(filterMovies)
    }
    res.json(movies)
})

//para recuperar por el id
app.get('/movies/:id',(req,res)=>{
    const {id}=req.params 
    const movie = movies.find(movie => movie.id ==id)
    if(movie) return res.json(movie)
      res.status(404).json({mesage: 'Not found'})
})

app.post('/movies', (req, res) => {    
   // console.log(req.body)
    const result = validateMovie(req.body)
    //console.log(req.body)
    if(result.error){
        return res.status(400).json({error: JSON.parse (result.error.mesage)}) //400 bad request
    }
    const newMovie ={
        id:crypto.randomUUID(),
       ...result.data
    }
    //cambiar luego 
    movies.push(newMovie)
    res.status(201).json(newMovie) //actualizar la cache del cliente
})

//actualizar 
app.patch('/movies/:id', (req, res) => {   
    const result = validatePartialMovie (req.body)
    if(result.error){
        return res.status(400).json({error: JSON.parse (result.error.mesage)}) //400 bad request
    }

    const {id}= req.params
    const movieIndex = movies.findIndex(movie=>movie.id==id)
    if(movieIndex ===-1){
        return res.status(400).json({mesage: 'Movie not found'})
    }
    const updateMovie = {
    ...movies[movieIndex],
    ...result.data
    }
    movies[movieIndex]=updateMovie
    return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
  
    if (movieIndex === -1) {
      return res.status(404).json({ message: 'Movie not found' })
    }
  
    movies.splice(movieIndex, 1)
  
    return res.json({ message: 'Movie deleted' })
  })

const PORT = process.env.PORT ?? 1234
app.listen(PORT, ()=>{
    console.log(`server listening on port http://localhost:${PORT}`)
})
