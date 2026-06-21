// Elementos del DOM
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const whatsappBtn = document.getElementById('whatsappBtn');
const whatsappFloat = document.getElementById('whatsappFloat');
const whatsappModal = document.getElementById('whatsappModal');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const whatsappForm = document.getElementById('whatsappForm');
const sendWhatsappBtn = document.getElementById('sendWhatsappBtn');
const getLocationBtn = document.getElementById('getLocationBtn');
const locationText = document.getElementById('locationText');
const customLocationInput = document.getElementById('customLocationInput');
const sendLocationRadio = document.getElementById('sendLocation');
const customLocationRadio = document.getElementById('customLocation');
const noLocationRadio = document.getElementById('noLocation');
const manualLocation = document.getElementById('manualLocation');

// Variables
let userLocation = null;
let userAddress = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar año actual en el footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Toggle del menú de navegación en móviles
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
    
    // Abrir modal de WhatsApp desde botón principal
    whatsappBtn.addEventListener('click', openWhatsappModal);
    
    // Abrir modal de WhatsApp desde botón flotante
    whatsappFloat.addEventListener('click', openWhatsappModal);
    
    // Cerrar modal de WhatsApp
    modalClose.addEventListener('click', closeWhatsappModal);
    modalCancel.addEventListener('click', closeWhatsappModal);
    
    // Cerrar modal al hacer clic fuera del contenido
    whatsappModal.addEventListener('click', function(e) {
        if (e.target === whatsappModal) {
            closeWhatsappModal();
        }
    });
    
    // Manejar opciones de ubicación
    sendLocationRadio.addEventListener('change', function() {
        customLocationInput.style.display = 'none';
    });
    
    customLocationRadio.addEventListener('change', function() {
        customLocationInput.style.display = 'block';
    });
    
    noLocationRadio.addEventListener('change', function() {
        customLocationInput.style.display = 'none';
    });
    
    // Obtener ubicación del usuario
    getLocationBtn.addEventListener('click', getUserLocation);
    
    // Enviar mensaje por WhatsApp
    sendWhatsappBtn.addEventListener('click', sendWhatsappMessage);
    
    // Manejar envío del formulario con Enter
    whatsappForm.addEventListener('submit', function(e) {
        e.preventDefault();
        sendWhatsappMessage();
    });
});

// Funciones
function openWhatsappModal() {
    whatsappModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeWhatsappModal() {
    whatsappModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    resetForm();
}

function resetForm() {
    whatsappForm.reset();
    userLocation = null;
    userAddress = null;
    locationText.textContent = 'Ubicación no incluida';
    customLocationInput.style.display = 'none';
}

function getUserLocation() {
    if (!navigator.geolocation) {
        locationText.textContent = 'Geolocalización no soportada por tu navegador';
        return;
    }
    
    locationText.textContent = 'Obteniendo ubicación...';
    
    navigator.geolocation.getCurrentPosition(
        // Éxito
        async function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            userLocation = { lat, lng };
            
            try {
                // Obtener dirección en formato coloquial mexicano
                userAddress = await getMexicanAddress(lat, lng);
                locationText.textContent = `Ubicación obtenida: ${userAddress}`;
                sendLocationRadio.checked = true;
            } catch (error) {
                console.error('Error al obtener dirección:', error);
                locationText.textContent = `Coordenadas obtenidas: ${lat.toFixed(6)}, ${lng.toFixed(6)}. No se pudo obtener dirección específica.`;
                sendLocationRadio.checked = true;
            }
        },
        // Error
        function(error) {
            console.error('Error obteniendo ubicación:', error);
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    locationText.textContent = "Permiso de ubicación denegado. Puede escribir su ubicación manualmente.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    locationText.textContent = "Información de ubicación no disponible.";
                    break;
                case error.TIMEOUT:
                    locationText.textContent = "Tiempo de espera agotado al obtener la ubicación.";
                    break;
                default:
                    locationText.textContent = "Error desconocido al obtener la ubicación.";
            }
        },
        // Opciones
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

async function getMexicanAddress(lat, lng) {
    try {
        // Usamos la API de Nominatim (OpenStreetMap) que es gratuita y no requiere clave
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`
        );
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const data = await response.json();
        
        if (data && data.address) {
            const address = data.address;
            // Formato coloquial mexicano: calle, colonia, municipio, estado
            let mexicanAddress = '';
            
            if (address.road) mexicanAddress += address.road;
            if (address.suburb) mexicanAddress += `, ${address.suburb}`;
            if (address.village || address.town || address.city) {
                mexicanAddress += `, ${address.village || address.town || address.city}`;
            }
            if (address.municipality && address.municipality !== (address.village || address.town || address.city)) {
                mexicanAddress += `, ${address.municipality}`;
            }
            if (address.state) mexicanAddress += `, ${address.state}`;
            
            return mexicanAddress || 'Ubicación obtenida, pero no se pudo formatear correctamente';
        } else {
            return `Cerca de las coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
    } catch (error) {
        console.error('Error en geocodificación inversa:', error);
        // Fallback a coordenadas simples
        return `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
}

function sendWhatsappMessage() {
    // Validar formulario
    const userName = document.getElementById('userName').value.trim();
    const userPhone = document.getElementById('userPhone').value.trim();
    const userMessage = document.getElementById('userMessage').value.trim();
    
    if (!userName || !userPhone || !userMessage) {
        alert('Por favor complete todos los campos obligatorios (*)');
        return;
    }
    
    // Formatear número de teléfono (eliminar espacios, guiones, etc.)
    const formattedPhone = userPhone.replace(/\D/g, '');
    
    // Determinar el texto de ubicación según la opción seleccionada
    let locationText = '';
    
    if (sendLocationRadio.checked && userAddress) {
        locationText = `\n📍 Mi ubicación: ${userAddress}`;
    } else if (customLocationRadio.checked && manualLocation.value.trim()) {
        locationText = `\n📍 Mi ubicación: ${manualLocation.value.trim()}`;
    } else {
        locationText = '\n📍 No se proporcionó ubicación específica.';
    }
    
    // Crear mensaje para WhatsApp
    const whatsappMessage = `Hola, soy *${userName}*. Necesito servicio de grúa.\n\n*Detalles:* ${userMessage}\n\n*Teléfono de contacto:* ${userPhone}${locationText}\n\nEste mensaje fue enviado desde la página web de Grúas Alexis.`;
    
    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    // Determinar si es Android o navegador web
    const isAndroid = /Android/i.test(navigator.userAgent);
    let whatsappUrl;
    
    // Número de teléfono de Grúas Alexis (cambiar por el número real)
    const businessPhone = '524429999999';
    
    if (isAndroid) {
        // Para Android: usar el esquema intent de WhatsApp
        whatsappUrl = `whatsapp://send?phone=${businessPhone}&text=${encodedMessage}`;
    } else {
        // Para navegadores web: usar la versión web de WhatsApp
        whatsappUrl = `https://web.whatsapp.com/send?phone=${businessPhone}&text=${encodedMessage}`;
    }
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Cerrar modal después de un breve retraso
    setTimeout(() => {
        closeWhatsappModal();
    }, 500);
}

// Detectar si FontAwesome está cargado, si no, mostrar el SVG
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si FontAwesome está cargado después de un tiempo
    setTimeout(function() {
        const whatsappIcon = document.querySelector('.whatsapp-font');
        if (!whatsappIcon || getComputedStyle(whatsappIcon).display === 'none') {
            // FontAwesome no está cargado, asegurarnos de que el SVG sea visible
            const whatsappSvg = document.querySelector('.whatsapp-svg');
            if (whatsappSvg) {
                whatsappSvg.style.display = 'block';
            }
        }
    }, 2000);
});