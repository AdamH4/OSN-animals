
var express = require('express')
var app = express()
// const axios = require('axios')

app.use(express.static('public'))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

let animals = [
    {
        name: "zebra",
        weight: 100,
    },
    {
        name: "dog",
        weight: 15,
    },
    {
        name: "horse",
        weight: 150,
    },
    {
        name: "cat",
        weight: 3,
    },
    {
        name: "snake",
        weight: 1,
    },
]

/*
 * @api [get] /
 * description: Greeting from server
 * responses:
 *   200:
 *     description: Greeting message.
 */
app.get('/', function (req, res) {
   res.json({"message" : "Hello GET / route"});
})

/*
 * @api [get] /animals
 * description: Call another pod in Openshift cluster(like middleware)
 * responses:
 *   200:
 *     description: Response from pod.
 */
app.get('/animals', async function (req, res) {
   res.json(animals)
})

app.listen(8080, function () {
   console.log("Example app listening at port 8080")
})
