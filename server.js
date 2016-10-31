const MongoClient = require('mongodb').MongoClient
const objectID = require('mongodb').ObjectID
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mqtt = require('mqtt').connect('mqtt://broker')
const chalk = require('chalk')
const app = express()

mqtt.on('connect', () => {
  mqtt.subscribe('/status/#')
  mqtt.subscribe('/currentSettings/#')
})

MongoClient.connect('mongodb://db', (err, db) => {

  mqtt.on('message', (topic, message) => {
    message = JSON.parse(message.toString())
    console.log(JSON.stringify(message))
    // message is a device defintion or a devices status report
    topicRegExp = new RegExp(/currentSettings\/.*/)
    topicRegExp.test(topic) ? updateDevice(message) : addStatus(message)
  })

  // each device and its current settings (one document per device)
  let updateDevice = device => {
    db.collection('devices')
      .updateOne({ 'deviceID': device.deviceID }, { $set: device }, { upsert: true })
  }

  // inputs usually append a document, outputs usually update a single document (its current state)
  let addStatus = status => {
    db.collection('devices').findOne({ 'deviceID': status.deviceID }, (err, result) => {
      switch (result.primaryType) {
        case 'digitalOutput':
          db.collection('statuses')
            .updateOne({ 'deviceID': status.deviceID }, { $set: status }, { upsert: true })
          break
        case 'digitalInput':
          db.collection('statuses').insertOne(status)
          break
        case 'analogOutput':
          db.collection('statuses')
            .updateOne({ 'deviceID': status.deviceID }, { $set: status }, { upsert: true })
        case 'analogInput':
          db.collection('statuses').insertOne(status)
          break
      }
    })
  }

  app.use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(require('morgan')('dev'))

    .use(express.static(path.join(__dirname, 'dist')))

    .get('/devices', (req, res) => {
      db.collection('devices')
        .find({}).toArray((err, docs) => {
          res.send(docs)
        })
    })

    .get('/statuses/:deviceID', (req, res) => {
      console.log(req.params.id)
      db.collection('statuses')
        .find({ 'deviceID': +req.params.deviceID })
        .toArray((err, docs) => {
          if (err) console.log(err)
          console.log(JSON.stringify(docs, null, 2))
          res.send(docs)
        })
    })

    .post('/publish', (req, res) => {
      mqtt.publish(`${req.body.topic}`, req.body.message)
      res.status(200).send('message published')
    })

    .delete('/statuses/:id', (req, res) => {
      db.collection('statuses')
        .deleteOne({ _id: new objectID(req.params.id) }, (err, result) => {
          if (err) console.log(err)
          res.send(result)
        })
    })

    .get('/broker', (req, res) => {
      res.send('mqtt//broker')
    })

    .listen(3000)
})
module.exports = app;