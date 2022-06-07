class Cart {
    constructor(carts) {
        this.carts = carts;
    }

    getAll(req, res) {
        res.json({carts: this.carts});
    }


    getCart(req, res) {
        const cart = this.carts.find(elem => elem.id === Number(req.params.id))

        if (cart) {
            res.json(cart)
        } else {
            res.status(404).json({error: "Not found"})
        }
    }


    getCartProducts(req, res) {
        const cart = this.carts.find(elem => elem.id === Number(req.params.id))
        if (cart) {
            res.json({cartProducts: cart.products })
        } else {
            res.status(404).json({error: "Not found"})
        }
    }

    newCart(req, res) {
        let carts = this.carts;
        if (carts.length) {
            let newId = carts[carts.length - 1].id + 1;
            let newCart = carts;
            newCart.push({id: newId, timestamp: Date.now(), productos: []});
            res.json(newCart);
        } else {
            res.status(404).json({error: "Cannot create"})
        }
    }



    deleteCart(req, res) {
        let carts = this.carts;
        const cartIndex = carts.findIndex(elem => elem.id === Number(req.params.id));

        if (cartIndex < 0) {
            return res.status(404).send({error: "Cart not found"})
        }

        try {
            let contenidoNuevo = carts;
            contenidoNuevo.splice(cartIndex, 1);
            res.json({Mensaje: "Cart eliminated"});
        }
        catch(e) {
            console.log(e);
        }
    }

}

module.exports = Cart;