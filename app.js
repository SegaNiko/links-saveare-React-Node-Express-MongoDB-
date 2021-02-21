const express = require('express');
const config = require('config')
const mongoose = require('mongoose')

const app = express()

app.use(express.json({extended: true}))

app.use('/app/auth', require('./routes/auth.routes'))
app.use('/app/link', require('./routes/link.routes'))
app.use('/t', require('./routes/redirect.routes'))

const PORT = config.get('port') || 5000;

async function start() {
  try {
    await mongoose.connect(config.get("mongooseUri"),{
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    app.listen(5000, () => console.log(`App has been started on port ${PORT}...`))
  } catch(err){
    console.log('Server Error :', err.message);
    process.exit(1);
  }

}

start()