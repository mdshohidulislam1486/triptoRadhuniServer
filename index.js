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
    const addressCollection = dataBase.collection('address')
    const usersCollection = dataBase.collection('users')
    
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
        res.send(product)
    })
    //post  product 
    app.post('/products', async(req, res) =>{
        const product = req.body;
        const result = await productsCollection.insertOne(product)
        res.json(result)
    })
    // post Shipping Address 
    app.post('/shipping', async(req, res) =>{
        const address = req.body;
        const result = await addressCollection.insertOne(address)
        res.json(result)
    })

    // get api chekc if the user is a admin
    app.get('/users/:email', async(req, res) =>{
        const email = req.params.email
        const query = {email:email}
        const user = await usersCollection.findOne(query)
        let isAdmin =false
        if(user?.role === "admin"){
            isAdmin= true;
        }
        res.json({admin: isAdmin})
    })

    // Post Users register
    app.post('/users', async(req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user)
        res.json(result)
        console.log(result)
    })

    // Post Users with google 
    app.put('/users', async(req, res)=> {
        const user = req.body;
        const filter = {email: user.email}
        const options = {upsert: true}
        const updateDoc = {$set: user}
        const result = usersCollection.updateOne(filter, updateDoc, options)
        res.json(result)
    });

    app.put('/users/admin', async(req, res) =>{
        const user = req.body;
        const filter = {email: user.email}
        const updateDoc = {$set:{role:'admin'}}
        const result = await usersCollection.updateOne(filter, updateDoc)
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