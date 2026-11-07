import { Router } from 'express';
import { CanonicalController } from './canonical.controller.js';

const router = Router();

// 1. Ficha Maestra del Local (Consolida cabecera, fotos, beneficios, horarios y platos AR)
router.get('/restaurants/:slugOrId', CanonicalController.getRestaurantMaster);

// 2. Carta completa y platos en Realidad Aumentada (.glb/.usdz)
router.get('/restaurants/:restaurantId/menu', CanonicalController.getMenu);

// 3. Reseñas Verificadas (Solo comensales con reserva real)
router.get('/restaurants/:slugOrId/reviews', CanonicalController.getReviews);

// 4. Motor de Reservas: Bloqueo de 5 Minutos (Zero-Login con WhatsApp)
router.post('/bookings/hold', CanonicalController.createHold);

// 5. Confirmación de Depósito ($1.00) y Acreditación de Karma Points
router.post('/bookings/confirm-payment', CanonicalController.confirmPayment);

// 6. Consultar Estado de Reserva en Vivo
router.get('/bookings/:code', CanonicalController.getBooking);

export default router;
