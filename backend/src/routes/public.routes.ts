import { Router } from 'express';
import {
  getPublicStats,
  getPublicFeatures,
  getPublicBenefits,
  getPublicTestimonials,
  getPublicServiceFeatures,
  getPublicAnnouncements
} from '../controllers/public.controller';

const router = Router();

// ========== PUBLIC ENDPOINTS (No authentication required) ==========
router.get('/stats', getPublicStats);
router.get('/features', getPublicFeatures);
router.get('/benefits', getPublicBenefits);
router.get('/testimonials', getPublicTestimonials);
router.get('/service-features', getPublicServiceFeatures);

// ========== PUBLIC ANNOUNCEMENTS ==========
router.get('/announcements', getPublicAnnouncements);

export default router;