const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors')
const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config();


app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o6aff.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
    await client.connect()
    const dataBase = client.db('triptoRadhuni')
    const productsCollection = dataBase.collection('products')
    
    const myColl =[
        {id:1, name:'show', addres:"shit"}
    ]

    //get API
    app.get("/products", async(req, res) =>{
        const cursor = productsCollection.find({})
        const products = await cursor.toArray()
        res.send(products)
    })
    //get API
    app.get("/products/:id", async (req, res) =>{
        const id = req.params.id
        const query = {_id: ObjectId(id)}
        const product = await productsCollection.findOne(query)
        console.log(id)
        res.send(product)
    })


    // //post  API
    app.post('/products', async(req, res) =>{
        const product = req.body;
        console.log('hit the post api', product)
        const result = await productsCollection.insertOne(product)
        res.json(result)
    })


    }
    finally{
        // await client.close()
    }

}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Running Curd Server')
})

app.listen(port, () =>{
console.log('Running server on port', port)
})