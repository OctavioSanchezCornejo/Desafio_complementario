import express from 'express';

import mongoose from 'mongoose';

import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import { Server } from 'socket.io';

import productsRouterMongo from './routes/productsRouterMongo.js';
import cartsRouterMongo from './routes/cartsRouterMongo.js';
import chatRouterMongo from './routes/chatRouterMongo.js';

import ProductManagerMongo from './dao/mongo/productsManagerMongo.js';
import CartManagerMongo from './dao/mongo/cartsManagerMongo.js';

import { chatModel } from './dao/models/chatmodels.js';
import { productsModel } from './dao/models/productsmodels.js';

const productosMongo = new ProductManagerMongo();
const carritoMongo = new CartManagerMongo();


const app = express();

const httpServer = app.listen(8080, () => console.log("Servidor corriendo!!"));
const socketServer = new Server(httpServer);

app.engine('handlebars', handlebars.engine());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(__dirname + '/public'));
//app.use('/static', express.static('/public'));

mongoose.connect('mongodb+srv://davidferere:Pagaille.17@ecommerce.zxhcx9m.mongodb.net/?retryWrites=true&w=majority');

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

app.use('/mongo/products', productsRouterMongo); //endpoint para gestionar productos
app.use('/mongo/carts', cartsRouterMongo);

app.use('/mongo/chat', chatRouterMongo); //endpoint del chat


//Sockets///

socketServer.on('connection', async socket => {
    console.log("Cliente nuevo conectado")
    //const allproducts = await productosMongo.getProducts(); 
    //console.log(response);
    //socketServer.emit('prod', allproducts);
    socket.on('message', data => {
      console.log(data);
    })

    ///endpoint chat///////

    socket.on('mensaje', async (data) => {
    
      await chatModel.create(data); 
      const mensajes = await chatModel.find().lean(); 
      console.log(mensajes); 
      socketServer.emit('nuevo_mensaje', mensajes);

    })


    socket.on('sendNewProduct', async id => {
      console.log(id);
        await productsModel.deleteOne(id);
        //const allproducts = await productos.getProducts(); 
        //console.log(response);
      socketServer.emit('prod', );

    })

    socket.on('sendNewProduct2', async add => {
        console.log(add);
        console.log(typeof(add));
        const title = add.title; 
        const description = add.description; 
        const price = add.price; 
        const thumbnail = add.thumbnail; 
        const code = add.code; 
        const stock = add.stock; 
        const status = add.status; 
        const category = add.category;

        const response = await  productosMongo.createproduct(title, description, price, thumbnail, code, stock, status, category);
        const allproducts = await productsModel.find().lean(); 
        console.log(allproducts);
        socketServer.emit('prod', allproducts);

    })

    socket.on('addproductCarrito', async idprod => {
      
      console.log(idprod);
      const id = idprod.id; 
      const quan = idprod.quantity;
      //const quantity = 1; 
        //const response = await productos.deleteproductByID(id);
      const response = await carritoMongo.createcart(id, quan); 
      //console.log(response);
      socketServer.emit('prod', );

    })

    socket.emit('dataserver', "Hola soy el servidor")

});
