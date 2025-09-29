import { Request, Response } from 'express';
import Location, { ILocation } from '../models/location';

// GET /api/locations - Retrieve all locations
export const getLocations = async (req: Request, res: Response) => {
  try {
    const locations = await Location.find({}, 'name id').lean();
    res.status(200).json({ success: true, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching locations', error });
  }
};

// POST /api/locations - Add a new location
export const addLocation = async (req: Request, res: Response) => {
  const { name, id } = req.body;

  // Validate request body
  if (!name || !id) {
    return res.status(400).json({ success: false, message: 'Name and ID are required' });
  }

  try {
    // Check for existing location
    const existingLocation = await Location.findOne({ $or: [{ name }, { id }] });
    if (existingLocation) {
      return res.status(400).json({ success: false, message: 'Location name or ID already exists' });
    }

    // Create and save new location
    const newLocation = new Location({ name, id });
    await newLocation.save();
    res.status(201).json({ success: true, data: newLocation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding location', error });
  }
};

// DELETE /api/locations/:id - Delete a location by ID
export const deleteLocation = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const location = await Location.findOneAndDelete({ id });
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    res.status(200).json({ success: true, message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting location', error });
  }
};