
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
    //const cluster = {
    //    server: 'http://localhost:8001/',
    //    skipTLSVerify: true
    //}
    //const user = {
    //    name: "kube-admin",
    //    token: 'sha256~PC58Xr-U2s8IvHSpx6ie9bv6PPmBKEj__z9rHD-JjjY'
    //}

    kc.loadFromDefault()

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
            console.log("DONE:", err)
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
