// // ===== FILE: controllers/nonvegCatalogController.ts (UPDATED) =====
// // MODIFIED: Updated non-veg catalog controller with menu details connection

// import { Request, Response } from 'express';
// import CatalogItem from '../models/catalogItem';
// import { MenuDetails } from '../models/menuDetails'; // FIXED: Changed from Menu to MenuDetails
// import { deleteImageFile } from './uploadController';

// // HELPER FUNCTION: Delete old image file when updating
// const handleImageUpdate = (oldImageUrl: string, newImageUrl: string): void => {
//   try {
//     if (oldImageUrl !== newImageUrl && oldImageUrl.includes('/uploads/')) {
//       const deleted = deleteImageFile(oldImageUrl);
//       if (deleted) {
//         console.log('Old non-veg catalog image successfully deleted:', oldImageUrl);
//       }
//     }
//   } catch (error) {
//     console.error('Error handling image update:', error);
//   }
// };

// // HELPER FUNCTION: Update connected menu details when catalog changes
// const updateConnectedMenuDetails = async (catalogItem: any): Promise<void> => {
//   try {
//     if (catalogItem.menuDetailId) {
//       // FIXED: Changed Menu to MenuDetails
//       await MenuDetails.findByIdAndUpdate(
//         catalogItem.menuDetailId,
//         {
//           priceMonthly: catalogItem.price,
//           imageUrl: catalogItem.imageUrl
//         }
//       );
//       console.log('Connected menu details updated for catalog item:', catalogItem._id);
//     }
//   } catch (error) {
//     console.error('Error updating connected menu details:', error);
//   }
// };

// export const getNonVegCatalog = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const nonVegItems = await CatalogItem.find({ type: 'non-veg' })
//       .populate('menuDetailId', 'title description deliveryTime priceTrial weeklyMenu')
//       .sort({ createdAt: -1 });
    
//     res.json({
//       success: true,
//       data: nonVegItems,
//       count: nonVegItems.length
//     });
//   } catch (error) {
//     console.error('Error fetching non-veg catalog:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching non-veg catalog items',
//       error: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };

// export const getNonVegCatalogByCategory = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { category } = req.params;
    
//     const nonVegItems = await CatalogItem.find({ 
//       type: 'non-veg', 
//       category: category 
//     })
//     .populate('menuDetailId', 'title description deliveryTime priceTrial weeklyMenu')
//     .sort({ createdAt: -1 });
    
//     res.json({
//       success: true,
//       data: nonVegItems,
//       count: nonVegItems.length,
//       category: category
//     });
//   } catch (error) {
//     console.error('Error fetching non-veg catalog by category:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching non-veg catalog items by category',
//       error: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };

// export const createNonVegCatalogItem = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { category, imageUrl, price, menuDetailId } = req.body;

//     // Validate required fields
//     if (!category || !imageUrl || !price) {
//       res.status(400).json({
//         success: false,
//         message: 'Category, imageUrl, and price are required'
//       });
//       return;
//     }

//     // Validate price is a positive number
//     if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
//       res.status(400).json({
//         success: false,
//         message: 'Price must be a positive number'
//       });
//       return;
//     }

//     // Check if item already exists for this category
//     const existingItem = await CatalogItem.findOne({ category, type: 'non-veg' });
//     if (existingItem) {
//       res.status(409).json({
//         success: false,
//         message: 'Non-veg catalog item with this category already exists'
//       });
//       return;
//     }

//     // Create new catalog item
//     const newItem = new CatalogItem({
//       category,
//       imageUrl,
//       price: parseFloat(price),
//       type: 'non-veg',
//       menuDetailId: menuDetailId || null
//     });

//     const savedItem = await newItem.save();

//     // If menuDetailId is provided, update the menu to reference this catalog item
//     if (menuDetailId) {
//       // FIXED: Changed Menu to MenuDetails
//       await MenuDetails.findByIdAndUpdate(menuDetailId, {
//         catalogItemId: savedItem._id
//       });
//     }

//     console.log('New non-veg catalog item created:', {
//       id: savedItem._id,
//       category: savedItem.category,
//       imageUrl: savedItem.imageUrl,
//       price: savedItem.price,
//       menuDetailId: savedItem.menuDetailId
//     });

//     res.status(201).json({
//       success: true,
//       data: savedItem,
//       message: 'Non-veg catalog item created successfully'
//     });
//   } catch (error) {
//     console.error('Error creating non-veg catalog item:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating non-veg catalog item',
//       error: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };

// export const updateNonVegCatalogItem = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const { category, imageUrl, price, menuDetailId } = req.body;

//     // Validate required fields
//     if (!category || !imageUrl || !price) {
//       res.status(400).json({
//         success: false,
//         message: 'Category, imageUrl, and price are required'
//       });
//       return;
//     }

//     // Find existing item first to handle image cleanup
//     const existingItem = await CatalogItem.findOne({ _id: id, type: 'non-veg' });
//     if (!existingItem) {
//       res.status(404).json({
//         success: false,
//         message: 'Non-veg catalog item not found'
//       });
//       return;
//     }

//     // Handle image update - delete old image if new one is uploaded
//     handleImageUpdate(existingItem.imageUrl, imageUrl);

//     // Update the catalog item
//     const updatedItem = await CatalogItem.findOneAndUpdate(
//       { _id: id, type: 'non-veg' },
//       { 
//         category, 
//         imageUrl,
//         price: parseFloat(price),
//         menuDetailId: menuDetailId || existingItem.menuDetailId
//       },
//       { new: true, runValidators: true }
//     );

//     // Update connected menu details
//     if (updatedItem) {
//       await updateConnectedMenuDetails(updatedItem);
//     }

//     console.log('Non-veg catalog item updated:', {
//       id: updatedItem?._id,
//       category: updatedItem?.category,
//       imageUrl: updatedItem?.imageUrl,
//       price: updatedItem?.price
//     });

//     res.json({
//       success: true,
//       data: updatedItem,
//       message: 'Non-veg catalog item updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating non-veg catalog item:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating non-veg catalog item',
//       error: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };

// export const deleteNonVegCatalogItem = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;

//     // Find item first to get image URL for cleanup
//     const itemToDelete = await CatalogItem.findOne({ _id: id, type: 'non-veg' });
//     if (!itemToDelete) {
//       res.status(404).json({
//         success: false,
//         message: 'Non-veg catalog item not found'
//       });
//       return;
//     }

//     // Delete associated image file when deleting catalog item
//     if (itemToDelete.imageUrl && itemToDelete.imageUrl.includes('/uploads/')) {
//       const deleted = deleteImageFile(itemToDelete.imageUrl);
//       if (deleted) {
//         console.log('Associated image deleted for non-veg catalog item:', id);
//       }
//     }

//     // Remove reference from connected menu details
//     if (itemToDelete.menuDetailId) {
//       // FIXED: Changed Menu to MenuDetails
//       await MenuDetails.findByIdAndUpdate(itemToDelete.menuDetailId, {
//         catalogItemId: null
//       });
//     }

//     // Delete the catalog item
//     const deletedItem = await CatalogItem.findOneAndDelete({ _id: id, type: 'non-veg' });

//     console.log('Non-veg catalog item deleted:', {
//       id: deletedItem?._id,
//       category: deletedItem?.category
//     });

//     res.json({
//       success: true,
//       data: deletedItem,
//       message: 'Non-veg catalog item deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting non-veg catalog item:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting non-veg catalog item',
//       error: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };

// controllers/nonvegCatalogController.ts - CLOUDINARY INTEGRATED
import { Request, Response } from 'express';
import CatalogItem from '../models/catalogItem';
import { MenuDetails } from '../models/menuDetails';
import { deleteFromCloudinary } from '../utils/cloudinaryUpload';

const useCloudinary = process.env.NODE_ENV === 'production';

// HELPER FUNCTION: Delete old image (Cloudinary or local)
const handleImageUpdate = async (
  oldImageUrl: string, 
  newImageUrl: string,
  oldImagePublicId?: string
): Promise<void> => {
  try {
    if (oldImageUrl !== newImageUrl) {
      if (useCloudinary && oldImagePublicId) {
        await deleteFromCloudinary(oldImagePublicId);
        console.log('Old non-veg catalog image deleted from Cloudinary:', oldImagePublicId);
      }
      // Local deletion logic for development can stay if needed
    }
  } catch (error) {
    console.error('Error handling image update:', error);
  }
};

// HELPER FUNCTION: Update connected menu details when catalog changes
const updateConnectedMenuDetails = async (catalogItem: any): Promise<void> => {
  try {
    if (catalogItem.menuDetailId) {
      const updateData: any = {
        priceMonthly: catalogItem.price,
        imageUrl: catalogItem.imageUrl
      };
      
      // Add imagePublicId if using Cloudinary
      if (catalogItem.imagePublicId) {
        updateData.imagePublicId = catalogItem.imagePublicId;
      }

      await MenuDetails.findByIdAndUpdate(
        catalogItem.menuDetailId,
        updateData
      );
      console.log('Connected menu details updated for catalog item:', catalogItem._id);
    }
  } catch (error) {
    console.error('Error updating connected menu details:', error);
  }
};

export const getNonVegCatalog = async (req: Request, res: Response): Promise<void> => {
  try {
    const nonVegItems = await CatalogItem.find({ type: 'non-veg' })
      .populate('menuDetailId', 'title description deliveryTime priceTrial weeklyMenu')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: nonVegItems,
      count: nonVegItems.length
    });
  } catch (error) {
    console.error('Error fetching non-veg catalog:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching non-veg catalog items',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getNonVegCatalogByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    
    const nonVegItems = await CatalogItem.find({ 
      type: 'non-veg', 
      category: category 
    })
    .populate('menuDetailId', 'title description deliveryTime priceTrial weeklyMenu')
    .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: nonVegItems,
      count: nonVegItems.length,
      category: category
    });
  } catch (error) {
    console.error('Error fetching non-veg catalog by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching non-veg catalog items by category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createNonVegCatalogItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, imageUrl, imagePublicId, price, menuDetailId } = req.body;

    // Validate required fields
    if (!category || !imageUrl || !price) {
      res.status(400).json({
        success: false,
        message: 'Category, imageUrl, and price are required'
      });
      return;
    }

    // Validate price is a positive number
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
      return;
    }

    // Check if item already exists for this category
    const existingItem = await CatalogItem.findOne({ category, type: 'non-veg' });
    if (existingItem) {
      res.status(409).json({
        success: false,
        message: 'Non-veg catalog item with this category already exists'
      });
      return;
    }

    // Create new catalog item
    const catalogData: any = {
      category,
      imageUrl,
      price: parseFloat(price),
      type: 'non-veg',
      menuDetailId: menuDetailId || null
    };

    // Add imagePublicId if provided (Cloudinary)
    if (imagePublicId) {
      catalogData.imagePublicId = imagePublicId;
    }

    const newItem = new CatalogItem(catalogData);
    const savedItem = await newItem.save();

    // If menuDetailId is provided, update the menu to reference this catalog item
    if (menuDetailId) {
      const menuUpdateData: any = { catalogItemId: savedItem._id };
      await MenuDetails.findByIdAndUpdate(menuDetailId, menuUpdateData);
    }

    console.log('New non-veg catalog item created:', {
      id: savedItem._id,
      category: savedItem.category,
      imageUrl: savedItem.imageUrl,
      imagePublicId: savedItem.imagePublicId,
      price: savedItem.price,
      menuDetailId: savedItem.menuDetailId
    });

    res.status(201).json({
      success: true,
      data: savedItem,
      message: 'Non-veg catalog item created successfully'
    });
  } catch (error) {
    console.error('Error creating non-veg catalog item:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating non-veg catalog item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateNonVegCatalogItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { category, imageUrl, imagePublicId, price, menuDetailId } = req.body;

    // Validate required fields
    if (!category || !imageUrl || !price) {
      res.status(400).json({
        success: false,
        message: 'Category, imageUrl, and price are required'
      });
      return;
    }

    // Find existing item first to handle image cleanup
    const existingItem = await CatalogItem.findOne({ _id: id, type: 'non-veg' });
    if (!existingItem) {
      res.status(404).json({
        success: false,
        message: 'Non-veg catalog item not found'
      });
      return;
    }

    // Handle image update - delete old image if new one is uploaded
    if (existingItem.imageUrl !== imageUrl) {
      await handleImageUpdate(
        existingItem.imageUrl, 
        imageUrl,
        existingItem.imagePublicId
      );
    }

    // Update the catalog item
    const updateData: any = {
      category,
      imageUrl,
      price: parseFloat(price),
      menuDetailId: menuDetailId || existingItem.menuDetailId
    };

    // Update imagePublicId if provided
    if (imagePublicId) {
      updateData.imagePublicId = imagePublicId;
    }

    const updatedItem = await CatalogItem.findOneAndUpdate(
      { _id: id, type: 'non-veg' },
      updateData,
      { new: true, runValidators: true }
    );

    // Update connected menu details
    if (updatedItem) {
      await updateConnectedMenuDetails(updatedItem);
    }

    console.log('Non-veg catalog item updated:', {
      id: updatedItem?._id,
      category: updatedItem?.category,
      imageUrl: updatedItem?.imageUrl,
      imagePublicId: updatedItem?.imagePublicId,
      price: updatedItem?.price
    });

    res.json({
      success: true,
      data: updatedItem,
      message: 'Non-veg catalog item updated successfully'
    });
  } catch (error) {
    console.error('Error updating non-veg catalog item:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating non-veg catalog item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteNonVegCatalogItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Find item first to get image info for cleanup
    const itemToDelete = await CatalogItem.findOne({ _id: id, type: 'non-veg' });
    if (!itemToDelete) {
      res.status(404).json({
        success: false,
        message: 'Non-veg catalog item not found'
      });
      return;
    }

    // Delete associated image
    if (itemToDelete.imageUrl) {
      if (useCloudinary && itemToDelete.imagePublicId) {
        await deleteFromCloudinary(itemToDelete.imagePublicId);
        console.log('Cloudinary image deleted for non-veg catalog item:', id);
      }
      // Local deletion can stay for development
    }

    // Remove reference from connected menu details
    if (itemToDelete.menuDetailId) {
      await MenuDetails.findByIdAndUpdate(itemToDelete.menuDetailId, {
        catalogItemId: null
      });
    }

    // Delete the catalog item
    const deletedItem = await CatalogItem.findOneAndDelete({ _id: id, type: 'non-veg' });

    console.log('Non-veg catalog item deleted:', {
      id: deletedItem?._id,
      category: deletedItem?.category
    });

    res.json({
      success: true,
      data: deletedItem,
      message: 'Non-veg catalog item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting non-veg catalog item:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting non-veg catalog item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};