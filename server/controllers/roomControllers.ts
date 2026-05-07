// backend/controllers/roomController.ts
import { Request, Response } from 'express';
import Room from '../models/room';
import mongoose from 'mongoose';
import { deleteFromCloudinary } from '../config/cloudinary.config';

// ==========================================
// PUBLIC: GET ALL ROOMS (with filter + pagination)
// GET /api/rooms?gender=boy&bedType=single&page=1&limit=10
// ==========================================
export const getAllRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gender, bedType, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { isAvailable: true };

    if (gender && (gender === 'boy' || gender === 'girl')) {
      filter.gender = gender;
    }

    if (bedType && (bedType === 'single' || bedType === 'double')) {
      filter.bedType = bedType;
    }

    if (search && typeof search === 'string' && search.trim()) {
      filter.$or = [
        { lodgeName: { $regex: search.trim(), $options: 'i' } },
        { address: { $regex: search.trim(), $options: 'i' } },
        { ownerName: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const [rooms, total] = await Promise.all([
      Room.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Room.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      rooms,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.error('❌ getAllRooms Error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch rooms',
    });
  }
};

// ==========================================
// PUBLIC: GET SINGLE ROOM BY ID
// ==========================================
export const getRoomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid room ID' });
      return;
    }

    const room = await Room.findById(id).lean();

    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    res.status(200).json({ success: true, room });
  } catch (error) {
    console.error('❌ getRoomById Error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch room',
    });
  }
};

// ==========================================
// ADMIN: GET ALL ROOMS (including unavailable)
// ==========================================
export const getAllRoomsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gender, bedType, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (gender && (gender === 'boy' || gender === 'girl')) filter.gender = gender;
    if (bedType && (bedType === 'single' || bedType === 'double')) filter.bedType = bedType;

    if (search && typeof search === 'string' && search.trim()) {
      filter.$or = [
        { lodgeName: { $regex: search.trim(), $options: 'i' } },
        { address: { $regex: search.trim(), $options: 'i' } },
        { ownerName: { $regex: search.trim(), $options: 'i' } },
        { ownerContact: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const [rooms, total] = await Promise.all([
      Room.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Room.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      rooms,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.error('❌ getAllRoomsAdmin Error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch rooms',
    });
  }
};

// ==========================================
// ADMIN: CREATE ROOM (with Cloudinary upload)
// POST /api/admin/rooms
// ==========================================
export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      lodgeName,
      ownerName,
      ownerContact,
      address,
      googleMapLink,
      latitude,
      longitude,
      gender,
      bedType,
      rentPrice,
      description,
      isAvailable,
    } = req.body;

    // Validation
    if (!lodgeName || !ownerName || !ownerContact || !address || !googleMapLink) {
      res.status(400).json({
        success: false,
        message: 'lodgeName, ownerName, ownerContact, address, googleMapLink are required',
      });
      return;
    }

    if (!gender || !['boy', 'girl'].includes(gender)) {
      res.status(400).json({ success: false, message: 'gender must be boy or girl' });
      return;
    }

    if (!bedType || !['single', 'double'].includes(bedType)) {
      res.status(400).json({ success: false, message: 'bedType must be single or double' });
      return;
    }

    if (!/^[0-9]{10}$/.test(ownerContact)) {
      res.status(400).json({ success: false, message: 'Contact number must be 10 digits' });
      return;
    }

    // Process Cloudinary uploaded files
    // multer-storage-cloudinary attaches `path` (full URL) and `filename` (publicId) on each file
    let processedImages: { url: string; publicId?: string }[] = [];

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      processedImages = (req.files as Express.Multer.File[]).map((file) => {
        // Cloudinary multer storage puts the full URL in `path` and publicId in `filename`
        const f = file as Express.Multer.File & { path: string; filename: string };
        return {
          url: f.path,        // Full Cloudinary URL (https://res.cloudinary.com/...)
          publicId: f.filename, // Cloudinary public_id (e.g. "rooms/room-123-456")
        };
      });
    }

    const newRoom = await Room.create({
      lodgeName: lodgeName.trim(),
      ownerName: ownerName.trim(),
      ownerContact: ownerContact.trim(),
      address: address.trim(),
      googleMapLink: googleMapLink.trim(),
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      gender,
      bedType,
      rentPrice: rentPrice ? Number(rentPrice) : undefined,
      description: description?.trim(),
      images: processedImages,
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' || isAvailable === true : true,
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room: newRoom,
    });
  } catch (error) {
    console.error('❌ createRoom Error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create room',
    });
  }
};

// ==========================================
// ADMIN: UPDATE ROOM (with Cloudinary upload)
// PUT /api/admin/rooms/:id
// ==========================================
export const updateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid room ID' });
      return;
    }

    const room = await Room.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    const {
      lodgeName,
      ownerName,
      ownerContact,
      address,
      googleMapLink,
      latitude,
      longitude,
      gender,
      bedType,
      rentPrice,
      description,
      images, // Existing images that the admin wants to keep (sent as JSON string)
      isAvailable,
    } = req.body;

    if (lodgeName !== undefined) room.lodgeName = lodgeName.trim();
    if (ownerName !== undefined) room.ownerName = ownerName.trim();
    if (ownerContact !== undefined) {
      if (!/^[0-9]{10}$/.test(ownerContact)) {
        res.status(400).json({ success: false, message: 'Contact number must be 10 digits' });
        return;
      }
      room.ownerContact = ownerContact.trim();
    }
    if (address !== undefined) room.address = address.trim();
    if (googleMapLink !== undefined) room.googleMapLink = googleMapLink.trim();
    if (latitude !== undefined && latitude !== '') room.latitude = Number(latitude);
    if (longitude !== undefined && longitude !== '') room.longitude = Number(longitude);
    if (gender !== undefined && ['boy', 'girl'].includes(gender)) room.gender = gender;
    if (bedType !== undefined && ['single', 'double'].includes(bedType)) room.bedType = bedType;
    if (rentPrice !== undefined && rentPrice !== '') room.rentPrice = Number(rentPrice);
    if (description !== undefined) room.description = description.trim();
    if (isAvailable !== undefined) {
      room.isAvailable = isAvailable === 'true' || isAvailable === true;
    }

    // ============================================
    // IMAGE HANDLING (this is the key part)
    // ============================================
    // Step 1: Determine which existing images to KEEP
    let keptImages: { url: string; publicId?: string }[] = [];
    if (images) {
      try {
        const parsed = typeof images === 'string' ? JSON.parse(images) : images;
        if (Array.isArray(parsed)) {
          keptImages = parsed.map((img: string | { url: string; publicId?: string }) =>
            typeof img === 'string' ? { url: img } : img
          );
        }
      } catch {
        keptImages = [];
      }
    }

    // Step 2: Find images that were REMOVED (delete them from Cloudinary)
    const oldImages = room.images || [];
    const keptUrls = new Set(keptImages.map((img) => img.url));
    const removedImages = oldImages.filter((img) => !keptUrls.has(img.url));

    // Delete removed images from Cloudinary in background
    for (const img of removedImages) {
      if (img.publicId) {
        deleteFromCloudinary(img.publicId).catch((err) =>
          console.error('Failed to delete from Cloudinary:', err)
        );
      }
    }

    // Step 3: Process newly uploaded files
    let newImages: { url: string; publicId?: string }[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      newImages = (req.files as Express.Multer.File[]).map((file) => {
        const f = file as Express.Multer.File & { path: string; filename: string };
        return {
          url: f.path,
          publicId: f.filename,
        };
      });
    }

    // Step 4: Final image array = kept + newly uploaded
    room.images = [...keptImages, ...newImages];

    await room.save();

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      room,
    });
  } catch (error) {
    console.error('❌ updateRoom Error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update room',
    });
  }
};

// ==========================================
// ADMIN: DELETE ROOM (also deletes Cloudinary images)
// DELETE /api/admin/rooms/:id
// ==========================================
export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid room ID' });
      return;
    }

    const room = await Room.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    // Delete all images from Cloudinary first
    for (const img of room.images || []) {
      if (img.publicId) {
        await deleteFromCloudinary(img.publicId);
      }
    }

    await room.deleteOne();

    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    console.error('❌ deleteRoom Error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete room',
    });
  }
};

// ==========================================
// ADMIN: TOGGLE AVAILABILITY
// ==========================================
export const toggleRoomAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid room ID' });
      return;
    }

    const room = await Room.findById(id);
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    room.isAvailable = !room.isAvailable;
    await room.save();

    res.status(200).json({
      success: true,
      message: `Room marked as ${room.isAvailable ? 'available' : 'unavailable'}`,
      room,
    });
  } catch (error) {
    console.error('❌ toggleRoomAvailability Error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to toggle availability',
    });
  }
};

// ==========================================
// ADMIN: GET ROOM STATS
// ==========================================
export const getRoomStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [total, boyRooms, girlRooms, singleBed, doubleBed, available, unavailable] =
      await Promise.all([
        Room.countDocuments(),
        Room.countDocuments({ gender: 'boy' }),
        Room.countDocuments({ gender: 'girl' }),
        Room.countDocuments({ bedType: 'single' }),
        Room.countDocuments({ bedType: 'double' }),
        Room.countDocuments({ isAvailable: true }),
        Room.countDocuments({ isAvailable: false }),
      ]);

    res.status(200).json({
      success: true,
      stats: { total, boyRooms, girlRooms, singleBed, doubleBed, available, unavailable },
    });
  } catch (error) {
    console.error('❌ getRoomStats Error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch stats',
    });
  }
};