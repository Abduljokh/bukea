import { z } from 'zod';
import { CanonicalService } from './canonical.service.js';

const holdBookingSchema = z.object({
  restaurant: z.string().min(1, 'restaurant (slug o id) es requerido'),
  guestName: z.string().min(2, 'guestName es requerido'),
  phoneWhatsapp: z.string().min(8, 'phoneWhatsapp es requerido'),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  bookingTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  partySize: z.number().int().min(1).max(20),
  specialRequests: z.string().optional().default(''),
  preferredZone: z.string().optional().nullable()
});

const confirmPaymentSchema = z.object({
  bookingCode: z.string().min(4, 'bookingCode es requerido'),
  method: z.enum(['c2p', 'pago_movil', 'tarjeta', 'binance', 'karma_points']).default('pago_movil'),
  reference: z.string().min(3, 'Referencia de pago requerida')
});

export class CanonicalController {
  static async getRestaurantMaster(req, res, next) {
    try {
      const { slugOrId } = req.params;
      const data = await CanonicalService.getRestaurantMaster(slugOrId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getMenu(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { category, onlyAr } = req.query;
      const menu = await CanonicalService.getRestaurantMenu(restaurantId, {
        category,
        onlyAr: onlyAr === 'true'
      });
      res.json({ success: true, count: menu.length, data: menu });
    } catch (err) {
      next(err);
    }
  }

  static async createHold(req, res, next) {
    try {
      const parsed = holdBookingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: 'Datos de validación incorrectos',
          details: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message }))
        });
      }

      const result = await CanonicalService.createHoldBooking({
        restaurantSlugOrId: parsed.data.restaurant,
        guestName: parsed.data.guestName,
        phoneWhatsapp: parsed.data.phoneWhatsapp,
        bookingDate: parsed.data.bookingDate,
        bookingTime: parsed.data.bookingTime,
        partySize: parsed.data.partySize,
        specialRequests: parsed.data.specialRequests,
        preferredZone: parsed.data.preferredZone
      });

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async confirmPayment(req, res, next) {
    try {
      const parsed = confirmPaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: 'Datos de validación incorrectos',
          details: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message }))
        });
      }

      const result = await CanonicalService.confirmPayment(parsed.data);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getBooking(req, res, next) {
    try {
      const { code } = req.params;
      const data = await CanonicalService.getBookingByCode(code);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getReviews(req, res, next) {
    try {
      const { slugOrId } = req.params;
      const data = await CanonicalService.getReviews(slugOrId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}
