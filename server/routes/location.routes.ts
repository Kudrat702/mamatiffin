import express, { Request, Response } from "express";
import { getLocations, addLocation, deleteLocation } from "../controllers/location.controller";

const router = express.Router();

router.get("/", getLocations);
router.post("/", addLocation as (req: Request, res: Response) => any);
router.delete('/:id', deleteLocation as (req: Request, res: Response) => any); // DELETE /api/locations/:id
export default router;