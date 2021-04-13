require("dotenv").config();
const express = require('express')
const app = express();
const mongoose = require('mongoose')
const {MONGOURI} = require('./keys')
const PORT = process.env.PORT || 5000
const cors = require('cors')



require('./models/user')
require('./models/post')

app.use(cors())
app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))

mongoose.connect(MONGOURI,{ useNewUrlParser: true ,useUnifiedTopology: true})
mongoose.connection.on('connected',()=>{
    console.log('Connected to Mongo');
})

mongoose.connection.on('error',(err)=>{
    console.log('Error connecting',err);
})


app.listen(PORT,()=>{
    console.log(`Server listen to port at ${process.env.NODE_ENV}mode at ${PORT}`);
})