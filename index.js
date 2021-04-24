
var express = require('express')
var app = express()
const axios = require('axios')

app.use(express.static('public'))
app.use(function (req, res, next) {
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
    res.json({ "message": "Hello GET / route" });
})


app.get("/api", async (req, res) => {
    const token = "sha256~ZyYAmTZg9-WUdjKowjMxvrN1-ZrS2B_59uKt9JxEQ9Y"
    const response = await axios.get("https://api.crc.testing:6443/api/v1/namespaces/monitoring-cluster/pods", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    res.json(response.data)
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

const port = process.env.PORT || 8081
app.listen(port, function () {
    console.log("Example app listening at port " + port)
})
