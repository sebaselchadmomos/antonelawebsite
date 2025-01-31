// Configuración inicial
const CART_KEY = 'mystic_store_cart';
const MERCADOPAGO_PUBLIC_KEY = "APP_USR-d77859d2-ff5b-4775-923a-ba65d299c0f2"; // Reemplazar con tu clave pública de Mercado Pago

const PRODUCTOS = {
    1: { name: 'Mazo Rider-Waite', price: 18999 },
    2: { name: 'Kit Velas Rituales', price: 9850 },
    3: { name: 'Clase 1: Arcanos Mayores', price: 1 },
    4: { name: 'Clase 2: Arcanos Menores', price: 1 },
    5: { name: 'Clase 3: Tiradas', price: 1 }
};


let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function toggleCart() {
    document.getElementById('cartPanel').classList.toggle('active');
}

function addToCart(productId) {
    const product = PRODUCTOS[productId];
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    existingItem ? existingItem.quantity++ : cart.push({ ...product, id: productId, quantity: 1 });

    saveCart();
    updateCartUI();
}

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    // Actualizar items
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="item-info">
                <h4>${item.name}</h4>
                <div class="item-details">
                    <span>Cantidad: ${item.quantity}</span>
                    <span>$${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `).join('');

    // Actualizar total
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toLocaleString('es-AR')}`;
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Enviar a Mercado Pago
async function procesarPagoMercadoPago() {
    if (cart.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    // Lista de cursos con sus URLs específicas
    const cursoURLs = {
        "Clase 1: Arcanos Mayores": "curso1",
        "Clase 2: Arcanos Menores": "curso2",
        "Clase 3: Tiradas": "curso3"
    };

    // Filtrar los cursos en el carrito
    const cursosComprados = cart
        .filter(item => cursoURLs[item.name])
        .map(item => cursoURLs[item.name]);

    let successURL;

    if (cursosComprados.length === 1) {
        // Si solo hay un curso, redirigir a su página específica
        successURL = `https://antonelawebsite.netlify.app/${cursosComprados[0]}`;
    } else if (cursosComprados.length > 1) {
        // Si hay más de un curso, generar una URL personalizada
        successURL = `https://antonelawebsite.netlify.app/mis-cursos?c=${cursosComprados.join(",")}`;
    } else {
        // Si no hay cursos en la compra, redirigir a la página general de éxito
        successURL = "https://tusitio.com/success";
    }

    try {
        const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer APP_USR-1626069606855448-012723-d5d2547e9da034a6de3f95f99bdf67c5-1347089752`
            },
            body: JSON.stringify({
                items: cart.map(item => ({
                    title: item.name,
                    quantity: item.quantity,
                    currency_id: "ARS",
                    unit_price: item.price
                })),
                back_urls: {
                    success: successURL,
                    failure: "https://tusitio.com/failure",
                    pending: "https://tusitio.com/pending"
                },
                auto_return: "approved"
            })
        });

        const data = await response.json();
        if (data.init_point) {
            window.location.href = data.init_point;
        } else {
            alert("Error al generar el pago.");
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Hubo un problema al procesar el pago.");
    }
}


// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
});

