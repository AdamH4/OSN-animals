
var express = require('express')
const Websocket = require("ws")
var app = express()
const axios = require('axios')
const https = require('https')

app.use(express.static('public'))
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const agent = https.Agent({
    rejectUnauthorized: false
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
    res.json({ "message": "Hello GET / route" });
})


app.get("/api", async (req, res) => {
    const token = "ha256~mAk5IsNTBjuyCiXQOsNiU9IIcKEQtALhnQemmE2oycQ"
    try {
        // const socket = new Websocket("https://api.crc.testing:6443/api/v1/namespaces/monitoring-cluster/pods?watch=true", {
        //     headers: {
        //         Authorization: `Bearer ${token}`
        //     },
        // })
        // socket.on("*", (event) => {
        //     console.log(event)
        // })
        const response = await axios.get("https://api.crc.testing:6443/api/v1/namespaces/monitoring-cluster/pods", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            httpsAgent: agent
        })
        res.json(response.data)
    } catch (e) {
        console.log(e)
    }
})
/*
 * @api [get] /animals
 * description: Return array of animals
 * responses:
 *   200:
 *     description: Response from pod.
 */
app.get('/animals', async function (req, res) {
    res.json(animals)
})

const port = process.env.PORT || 8080
app.listen(port, function () {
    console.log("Example app listening at port " + port)
})
