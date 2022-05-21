const express = require('express')
const app = express();
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')

// CONN
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(res => console.log(`MongoDB connected ${res}`))
.catch(err => console.log(err))

app.use(morgan('dev'))
app.use(express.json())
app.use(cors())

app.use('/api', require('./routes/api'))

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})