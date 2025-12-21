// ================================
// CONFIGURACIÓN - DATOS DEL NEGOCIO
// ================================
const BUSINESS_CONFIG = {
    // Número de WhatsApp principal (formato internacional: 52 + 10 dígitos)
    whatsappNumber: '524427128200', // Número real: 52 442 712 8200
    
    // Nombre del negocio
    businessName: 'Grúas Alexis',
};

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

// Variables globales para ubicación
let userLocation = null;
let userAddress = null;
let userMapsUrl = null;
let userCoordinates = null;

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
    
    // Verificar si FontAwesome está cargado, si no, mostrar el SVG
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
    userMapsUrl = null;
    userCoordinates = null;
    locationText.textContent = 'Ubicación no incluida';
    customLocationInput.style.display = 'none';
}

// Función para validar y formatear número de teléfono
function formatPhoneForValidation(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    // Para números mexicanos:
    if (cleaned.length === 10) {
        // Número local de 10 dígitos: 4427128200
        return cleaned;
    } else if (cleaned.length === 12 && cleaned.startsWith('52')) {
        // Número con código de país: 524427128200
        return cleaned;
    } else if (cleaned.length === 13 && cleaned.startsWith('521')) {
        // Número con código de país y prefijo móvil: 5214427128200
        return cleaned;
    }
    
    return null;
}

function getUserLocation() {
    if (!navigator.geolocation) {
        locationText.textContent = 'Geolocalización no soportada por tu navegador';
        return;
    }
    
    locationText.innerHTML = '<span class="loading-location">Obteniendo ubicación...</span>';
    
    navigator.geolocation.getCurrentPosition(
        // Éxito
        async function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            userLocation = { lat, lng };
            
            try {
                // Obtener dirección en formato coloquial mexicano con enlace a Maps
                const locationData = await getMexicanAddress(lat, lng);
                userAddress = locationData.text;
                userMapsUrl = locationData.url;
                userCoordinates = locationData.coordinates;
                
                // Mostrar información con enlace a Google Maps
                locationText.innerHTML = `
                    <div class="location-info">
                        <div class="location-text">
                            <i class="fas fa-map-marker-alt"></i>
                            <span><strong>Ubicación obtenida:</strong> ${userAddress}</span>
                        </div>
                        <div class="location-link">
                            <a href="${userMapsUrl}" target="_blank" class="maps-link">
                                <i class="fas fa-external-link-alt"></i> Ver en Google Maps
                            </a>
                            <small>Coordenadas: ${userCoordinates}</small>
                        </div>
                    </div>
                `;
                sendLocationRadio.checked = true;
            } catch (error) {
                console.error('Error al obtener dirección:', error);
                // Crear enlace de Google Maps con las coordenadas
                const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=17`;
                userMapsUrl = googleMapsUrl;
                userCoordinates = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                
                locationText.innerHTML = `
                    <div class="location-info">
                        <div class="location-text">
                            <i class="fas fa-map-marker-alt"></i>
                            <span><strong>Ubicación:</strong> Coordenadas obtenidas</span>
                        </div>
                        <div class="location-link">
                            <a href="${googleMapsUrl}" target="_blank" class="maps-link">
                                <i class="fas fa-external-link-alt"></i> Ver en Google Maps
                            </a>
                            <small>Coordenadas: ${userCoordinates}</small>
                        </div>
                    </div>
                `;
                sendLocationRadio.checked = true;
            }
        },
        // Error
        function(error) {
            console.error('Error obteniendo ubicación:', error);
            let errorMessage = "Error obteniendo ubicación.";
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Permiso de ubicación denegado. Puede escribir su ubicación manualmente.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "Información de ubicación no disponible.";
                    break;
                case error.TIMEOUT:
                    errorMessage = "Tiempo de espera agotado al obtener la ubicación.";
                    break;
                default:
                    errorMessage = "Error desconocido al obtener la ubicación.";
            }
            
            locationText.innerHTML = `
                <div class="location-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${errorMessage}</span>
                </div>
            `;
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
        
        let mexicanAddress = '';
        let googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=17`;
        
        if (data && data.address) {
            const address = data.address;
            // Formato coloquial mexicano: calle, colonia, municipio, estado
            
            if (address.road) mexicanAddress += address.road;
            if (address.suburb) mexicanAddress += `, ${address.suburb}`;
            if (address.village || address.town || address.city) {
                mexicanAddress += `, ${address.village || address.town || address.city}`;
            }
            if (address.municipality && address.municipality !== (address.village || address.town || address.city)) {
                mexicanAddress += `, ${address.municipality}`;
            }
            if (address.state) mexicanAddress += `, ${address.state}`;
            
            return {
                text: mexicanAddress || `Cerca de las coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                url: googleMapsUrl,
                coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                rawAddress: address
            };
        } else {
            return {
                text: `Cerca de las coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                url: googleMapsUrl,
                coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                rawAddress: null
            };
        }
    } catch (error) {
        console.error('Error en geocodificación inversa:', error);
        // Fallback a coordenadas simples
        const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=17`;
        return {
            text: `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            url: googleMapsUrl,
            coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            rawAddress: null
        };
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
    
    // Validar y formatear teléfono del usuario
    const formattedUserPhone = formatPhoneForValidation(userPhone);
    if (!formattedUserPhone) {
        alert('Por favor ingrese un número de teléfono válido (10 dígitos). Ejemplo: 4427128200');
        return;
    }
    
    // Número de teléfono del negocio
    const businessPhone = BUSINESS_CONFIG.whatsappNumber;
    
    // Determinar el texto de ubicación según la opción seleccionada
    let locationContent = '';
    
    if (sendLocationRadio.checked && userAddress && userMapsUrl) {
        // Incluir dirección en texto y enlace a Google Maps
        locationContent = `\n📍 *Mi ubicación:* ${userAddress}\n🗺️ *Ver en Google Maps:* ${userMapsUrl}`;
        if (userCoordinates) {
            locationContent += `\n📌 *Coordenadas:* ${userCoordinates}`;
        }
    } else if (customLocationRadio.checked && manualLocation.value.trim()) {
        // Para ubicación manual, también podemos crear un enlace de búsqueda en Google Maps
        const manualLocationText = manualLocation.value.trim();
        const encodedLocation = encodeURIComponent(manualLocationText + ', San Diego de la Unión, Guanajuato');
        const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
        
        locationContent = `\n📍 *Mi ubicación:* ${manualLocationText}\n🗺️ *Buscar en Google Maps:* ${mapsSearchUrl}`;
    } else {
        locationContent = '\n📍 *Ubicación:* No se proporcionó ubicación específica.';
    }
    
    // Crear mensaje para WhatsApp
    const whatsappMessage = `Hola, soy *${userName}*. Necesito servicio de grúa.\n\n*Detalles del servicio:* ${userMessage}\n\n*Teléfono de contacto:* ${formattedUserPhone}${locationContent}\n\nEste mensaje fue enviado desde la página web de ${BUSINESS_CONFIG.businessName}.`;
    
    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    // Determinar si es Android o navegador web
    const isAndroid = /Android/i.test(navigator.userAgent);
    let whatsappUrl;
    
    if (isAndroid) {
        // Para Android: usar el esquema intent de WhatsApp
        whatsappUrl = `https://wa.me/${businessPhone}?text=${encodedMessage}`;
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