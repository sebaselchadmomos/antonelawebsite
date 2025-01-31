// Configuración inicial
const CART_KEY = 'mystic_store_cart';
const MERCADOPAGO_PUBLIC_KEY = "APP_USR-d77859d2-ff5b-4775-923a-ba65d299c0f2"; // Reemplazar con tu clave pública de Mercado Pago

const PRODUCTOS = {
    1: { name: 'Mazo Rider-Waite', price: 18999 },
    2: { name: 'Kit Velas Rituales', price: 9850 },
    3: { name: 'Clase 1: Arcanos Mayores', price: 2999 },
    4: { name: 'Clase 2: Arcanos Menores', price: 3499 },
    5: { name: 'Clase 3: Tiradas', price: 3999 }
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
                    success: "https://tusitio.com/success",
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
