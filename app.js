const openCart = document.querySelector('.cart-btn');
const closeCart = document.querySelector('.close-cart');
const clearopenCart = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

// cart
let cart = [];
// buttons
let buttonsDOM = [];

// display products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(({
            title,
            price,
            image,
            id
        }) => {
            result += `
    <article class="product">
            <div class="img-container">
                <img src=${image} alt="product" class='product-img'>
                <button class="bag-btn" data-id=${id}>
                    <i class='fas fa-shopping-cart'></i>
                    add to bag
                </button>
            </div>
            <h3>${title}</h3>
            <h4>$${price}</h4>
        </article>
    `
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);

            if (inCart) {
                button.innerText = 'In Cart';
                button.disabled = true;
            }

            button.addEventListener('click', (e) => {
                e.target.innerText = "In Cart";
                e.target.disabled = true;

                // get product from products
                let cartItem = {
                    ...Storage.getProduct(id),
                    amount: 1
                };

                // add product to the cart
                cart = [...cart, cartItem];

                // save cart in local storage
                Storage.saveCart(cart);
                
                // set cart values
                this.setItemValues(cart);
                // display cart item
                this.addToCart(cartItem);
                // show the cart
                this.showCart();
            });
        });
    }
    setItemValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addToCart({image, title, price, id, amount}) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${image} alt="product">
        <div>
            <h4>${title}</h4>
            <h5>$${price}</h5>
            <span class="remove-item" data-id=${id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${id}></i>
            <p class='item-amount'>${amount}</p>
            <i class="fas fa-chevron-down" data-id=${id}></i>
        </div>`;
        cartContent.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    setAPP() {
        cart = Storage.getCart();
        this.setItemValues(cart);
        this.populate(cart);
        openCart.addEventListener('click', this.showCart);
        closeCart.addEventListener('click', this.hideCart)
    }
    populate(cart) {
        cart.forEach(item => this.addToCart(item));
    }

    cartLogic() {
        // clear cart
        clearopenCart.addEventListener('click', () => {
            this.clearCart();
            this.hideCart();
        });
        // Cart functionality
        cartContent.addEventListener('click', e => {
            if (e.target.classList.contains('remove-item')) {
                let id = removeItem.dataset.id;
                this.removeItem(id);
                cartContent.removeChild(removeItem.parentElement.parentElement);
            } else if (e.target.classList.contains('fa-chevron-up')) {
                let id = e.target.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount += 1;
                Storage.saveCart(cart);
                this.setItemValues(cart);
                e.target.nextElementSibling.innerText = tempItem.amount;
            } else if (e.target.classList.contains('fa-chevron-down')) {
                let id = e.target.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount -= 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setItemValues(cart);
                    e.target.previousElementSibling.innerText = tempItem.amount;
                } else {
                    this.removeItem(id);
                    cartContent.removeChild(e.target.parentElement.parentElement);
                }
            }
        });
    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setItemValues(cart);
        Storage.saveCart(cart);

        let button = this.singleButton(id);
        button.disabled = false;
        button.innerHTML = `add to cart`;
    }
    singleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}




// getting the products
class Products {
    async getProducts() {
        try {
            let result = await fetch('products.json');
            let data = await result.json();

            let products = data.items;
            products = products.map(item => {
                const {
                    title,
                    price
                } = item.fields;
                const {
                    id
                } = item.sys
                const image = item.fields.image.fields.file.url;
                return {
                    title,
                    price,
                    id,
                    image
                }
            })
            return products
        } catch (error) {
            console.log(error);
        }

    }
}

// local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();
    //setup app
    ui.setAPP();

    // get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic()
    });
});