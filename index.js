
var express = require('express')
const Websocket = require("ws")
const fs = require('fs')
var app = express()
const axios = require('axios')
const https = require('https')
const k8s = require('@kubernetes/client-node');

app.use(express.static('public'))
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})


// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const agent = https.Agent({
    rejectUnauthorized: false
})

const token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IkdqSGQ1U0RMN2wzcklKeHV6OXZ6OXYyY3BoX0RTMnRoTUJ4d2N5Tzg0WFkifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJtb25pdG9yaW5nLWNsdXN0ZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlY3JldC5uYW1lIjoiZGVmYXVsdC10b2tlbi1uNWJjdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50Lm5hbWUiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiN2U5MmJjMzMtMmE4Ni00MDhmLWI4NTUtNTQxOTVlNmUwMjJmIiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50Om1vbml0b3JpbmctY2x1c3RlcjpkZWZhdWx0In0.gKXRYHWQNgPMexXX1Hoq8U_YdkqcbtPlhLkFoRxJg7HnGpS_Iuka9fZsnq3n5RdDkyVepeHTZxlH-WQnYzJDrD8vdSSHGiUspPttlNd91uRJ8rixpRM9sc8xo5HG7EsBOjepuvK41LRGLeKMz90ovGz6uSFodOIJdptIAzC0LwiOONcRZ1aPq56xp0xVGFPF-LG47MBVGXEzRcCCcKEZCq9-Mpz0Szfm1RiO7uMyBkukq2Wq9rqPyA7UiRskThw0bieIZb92ug0vpKTEcjt07wUVDvsIOECaODNymb9i1oET12L5hFUBduKwZWBzRRgi5M1YPy3ad9W0QRF9_4qcqw"

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

app.get("/socket", async (req, res) => {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    const watch = new k8s.Watch(kc);
    watch.watch('/api/v1/namespaces/monitoring-cluster/pods',
        // optional query parameters can go here.
        {
            allowWatchBookmarks: true,
        },
        // callback is called for each received object.
        (type, apiObj, watchObj) => {
            if (type === 'ADDED') {
                console.log('new object:')
            } else if (type === 'MODIFIED') {
                console.log('changed object:')
            } else if (type === 'DELETED') {
                console.log('deleted object:')
            } else if (type === 'BOOKMARK') {
                console.log(`bookmark: ${watchObj.metadata.resourceVersion}`)
            } else {
                console.log('unknown type: ' + type)
            }
            // if (apiObj.metadata.name === "monitoring-cluster") 
            console.log(apiObj.metadata.name)
        },
        // done callback is called if the watch terminates normally
        (err) => {
            console.log(err)
        })
        .then((req) => {
            // watch returns a request object which you can use to abort the watch.
            setTimeout(() => { req.abort(); }, 10 * 1000)
        })
    res.status(200).send("NOICE")
})


app.get("/api", async (req, res) => {
    try {
        // console.log(fs.readFileSync("./ca.crt"))
        const socket = new Websocket("wss://localhost:8001/api/v1/namespaces/monitoring-cluster/pods?watch=true", {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            ca: fs.readFileSync('./ca.crt'),
            origin: 'http://localhost:8080'
        })
        socket.on('upgrade', x => console.log('upgrade', x.headers.upgrade));
        socket.on('open', () => console.log('open'));
        socket.on('message', x => console.log('message', JSON.stringify(x.toString())));
        socket.on('close', () => console.log('close'));
        // const response = await axios.get("http://localhost:8001/api/v1/namespaces/monitoring-cluster/pods", {
        // headers: {
        //     Authorization: `Bearer ${token}`
        // },
        // httpsAgent: agent
        // })
        // res.json(response.data)
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
