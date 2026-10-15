import express from "express"
import cluster from "cluster"
import os from "os"

const totalCPUs = os.cpus().length;

const PORT = 3000;

if(cluster.isPrimary){

    console.log(`Number of CPUs is ${totalCPUs}`)
    console.log(`Primary ${process.pid} is running`)

    for(let i=0; i<totalCPUs; i++){
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal)=>{
        console.log(`worker ${worker.process.pid} died`)
        console.log("Forking another....")
        cluster.fork()
        // process.exit(1)7
    })

}else{
    const app = express();

    console.log(`Worker ${process.pid} started`)

    app.get("/", (req, res)=>{
        res.send({
            message : "Hello world!!"
        })
    })

    app.get("/api/:n", (req, res)=>{
        let n = parseInt(req.params.n);

        if(n > 1000000) n = 1000000;

        let sum = 0;
        for(let i=0; i<=n; i++){
            sum += i;
        }

        res.send(`Final sum is ${sum} from worker ${process.pid}`)
    })

    app.listen(PORT, ()=>{
        console.log(`App is listening on port ${PORT} for worker ${process.pid}`)
    })
}