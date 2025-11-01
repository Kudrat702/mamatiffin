// server/routes/location.routes.ts
import express, { Request, Response } from "express";
import { 
  getLocations, 
  addLocation, 
  deleteLocation,
  updateLocation 
} from "../controllers/location.controller";

const router = express.Router();

// ✅ Startup Logging
console.log('🔧 Loading location routes...');

// GET all locations
router.get("/", getLocations);
console.log('  ✓ GET    /api/locations');

// POST new location
router.post("/", addLocation as (req: Request, res: Response) => any);
console.log('  ✓ POST   /api/locations');

// PUT update location (by _id or custom id)
router.put('/:id', updateLocation as (req: Request, res: Response) => any);
console.log('  ✓ PUT    /api/locations/:id');

// DELETE location (by _id or custom id)
router.delete('/:id', deleteLocation as (req: Request, res: Response) => any);
console.log('  ✓ DELETE /api/locations/:id');

console.log('✅ Location routes loaded successfully\n');

export default router;