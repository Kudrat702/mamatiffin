// server/controllers/location.controller.ts - COMPLETE FIXED VERSION

import { Request, Response } from 'express';
import Location, { ILocation } from '../models/location';
import mongoose from 'mongoose';

// GET /api/locations - Retrieve all locations
export const getLocations = async (req: Request, res: Response) => {
  try {
    const locations = await Location.find({}).lean();
    res.status(200).json({ success: true, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching locations', error });
  }
};

// POST /api/locations - Add a new location
export const addLocation = async (req: Request, res: Response) => {
  const { name, id } = req.body;

  if (!name || !id) {
    return res.status(400).json({ success: false, message: 'Name and ID are required' });
  }

  try {
    const existingLocation = await Location.findOne({ $or: [{ name }, { id }] });
    if (existingLocation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Location name or ID already exists' 
      });
    }

    const newLocation = new Location({ name, id });
    await newLocation.save();

    res.status(201).json({ success: true, data: newLocation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding location', error });
  }
};

// ✅ FIXED: DELETE /api/locations/:id - Delete by custom ID OR MongoDB _id
export const deleteLocation = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    console.log('🗑️ DELETE request received for ID:', id);

    // ✅ Validation
    if (!id || id === 'undefined' || id === 'null') {
      console.error('❌ Invalid ID provided:', id);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid location ID' 
      });
    }

    let location = null;

    // ✅ Strategy 1: Try to find by custom 'id' field first
    location = await Location.findOne({ id: id });
    console.log('🔍 Search by custom id:', location ? '✅ Found' : '❌ Not found');

    // ✅ Strategy 2: If not found by custom id, try MongoDB _id
    if (!location && mongoose.Types.ObjectId.isValid(id)) {
      console.log('🔍 Trying MongoDB _id...');
      location = await Location.findById(id);
      console.log('🔍 Search by _id:', location ? '✅ Found' : '❌ Not found');
    }

    // ✅ Not found at all
    if (!location) {
      console.error('❌ Location not found with ID:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Location not found' 
      });
    }

    // ✅ Delete the location
    await location.deleteOne();
    
    console.log('✅ Location deleted successfully:', {
      name: location.name,
      customId: location.id,
      _id: location._id
    });

    res.status(200).json({ 
      success: true, 
      message: 'Location deleted successfully',
      data: {
        name: location.name,
        id: location.id || location._id
      }
    });

  } catch (error) {
    console.error('❌ Error deleting location:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting location', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ✅ UPDATE /api/locations/:id - Update by custom ID OR MongoDB _id
export const updateLocation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, id: newId } = req.body;

  try {
    console.log('📝 UPDATE request for ID:', id);

    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid location ID' 
      });
    }

    let location = null;

    // Try custom id first
    location = await Location.findOne({ id: id });

    // Try MongoDB _id if not found
    if (!location && mongoose.Types.ObjectId.isValid(id)) {
      location = await Location.findById(id);
    }

    if (!location) {
      return res.status(404).json({ 
        success: false, 
        message: 'Location not found' 
      });
    }

    // Update fields
    if (name) location.name = name;
    if (newId) location.id = newId;

    await location.save();

    console.log('✅ Location updated successfully');
    res.status(200).json({ 
      success: true, 
      data: location 
    });

  } catch (error) {
    console.error('❌ Error updating location:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating location', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};