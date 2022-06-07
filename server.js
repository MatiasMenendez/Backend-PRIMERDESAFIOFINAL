const express = require('express');
const { Router } = express;
const Api = require("./api.js");
const Chat = require("./Chat.js");
const Cart = require("./Cart.js");
const { Server: IOServer } = require("socket.io");
const { Server: HttpServer } = require("http");

const app = express()
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

const router = Router();

const PORT = 8080;

const server = httpServer.listen(PORT, () => {
    console.log(`Server http listening in port ${server.address().port}`)
 })
server.on("error", error => console.log(`Error in server ${error}`));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./public"));
app.set("view engine", "ejs"); 
app.set("views", "./views") 

let products = [
    {
        title: "Yerba mate",
        timestamp: "",
        description:"Yerba mate amargo marca union",
        code:"abcd",
        stock: 15,
        price: 100,
        thumbnail: "https://http2.mlstatic.com/D_NQ_NP_2X_813618-MLA46121646793_052021-F.webp",
        id: 1
    }, 
    {
        title: "Mate de calabaza",
        timestamp: "",
        description:"Mate de calabaza hecho a mano",
        code:"bcd",
        stock: 20,
        price: 300,
        thumbnail: "https://http2.mlstatic.com/D_NQ_NP_702437-MLA48733352973_012022-O.webp",
        id: 2
    },
    {
        title: "Bombilla",
        timestamp: "",
        description:"bombilla de metal marca blabla",
        code:"cd",
        stock: 3,
        price: 50,
        thumbnail: "https://http2.mlstatic.com/D_NQ_NP_898479-MLA45731292464_042021-O.webp",
        id: 3
    },
    {
        title: "Mate de plastico",
        timestamp: "",
        description:"Mate impreso 3D",
        code:"d",
        stock: 7,
        price: 200,
        thumbnail: "https://http2.mlstatic.com/D_NQ_NP_796640-MLA43965840273_112020-O.webp",
        id: 4
    },
];

let carts = [
    {
        id: 1,
        timestamp: 1654565554505,
        products: [
          {
            title: "Yerba mate",
            timestamp: "",
            description:"Yerba mate amargo marca union",
            code:"abcd",
            stock: 15,
            price: 100,
            thumbnail: "https://http2.mlstatic.com/D_NQ_NP_2X_813618-MLA46121646793_052021-F.webp",
            id: 1
          }
        ]
    },
    {
        id: 2,
        timestamp: 1654565554505,
        products: [
            {
                title: "Bombilla",
                timestamp: "",
                description:"bombilla de metal marca blabla",
                code:"cd",
                stock: 3,
                price: 50,
                thumbnail: "https://http2.mlstatic.com/D_NQ_NP_898479-MLA45731292464_042021-O.webp",
                id: 3
            }
        ]
    }
]

const productsApi = new Api(products);
const myChat = new Chat("mensajes.json");
const cartApi = new Cart(carts);

io.on("connection", async socket => { 
    
    console.log("A new user is logged in");
    socket.emit("Productos", products);
    socket.emit("Mensajes", await myChat.getAll());

    socket.on("new-message", async data => {
        data.time = new Date().toLocaleString()//moment().locale("es").format('MMMM Do YYYY, h:mm:ss a'); 
        await myChat.save(data);
        io.sockets.emit("MensajeIndividual", data)
    })

    socket.on("nuevo-producto", data => {
        io.sockets.emit("ProductoIndividual", data)
    })
})

app.get('', (req, res) => {
    const data ={products}
    return res.render('pages/index', data)
})

//Products endpoints

router.get('/products', (req, res) => {
    return productsApi.getAll(req, res)
 })

router.get('/products/:id', (req, res) => {
    return productsApi.getProduct(req, res)
 })


router.put("/products/:id", (req, res) => {
    const admin = true;
    if (admin === true){
    return productsApi.putProduct(req, res)}
    else{
        res.status(404).json({error: "You are not an admin"})
    }
})

router.delete("/products/:id", (req, res) => {
    const admin = true;
    if (admin === true){
    return productsApi.deleteProduct(req, res)}
    else{
        res.status(404).json({error: "You are not an admin"})
    }
})

router.post('/productos', (req, res) => {
    const admin = true;
    if (admin === true){
    return productsApi.postProduct(req, res)}
    else{
        res.status(404).json({error: "You are not an admin"})
    }
})

router.get("/", (req, res) => {
    res.render("pages/index", { products: products});
});


// cart endpoints

router.get('/cart/:id', (req, res) => {
    return cartApi.getCart(req, res)
})


router.get('/carts', (req, res) => {
    return cartApi.getAll(req, res)
})


router.get('/cart/:id/products', (req, res) => {
    return cartApi.getCartProducts(req, res)
})



router.post('/cart', (req, res) => {
    return cartApi.newCart(req, res)
})


router.delete("/cart/:id", (req, res) => {
    return cartApi.deleteCart(req, res)
})


app.use('/', router);