// server/scripts/migrateToCloudinary.ts
import mongoose from 'mongoose';
import { MenuDetails } from '../models/menuDetails';
import CatalogItem from '../models/catalogItem';
import SliderImage from '../models/SliderImage';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function migrateMenus() {
  console.log('🔄 Starting menu images migration...');
  
  const menus = await MenuDetails.find({
    imageUrl: { $regex: '/uploads/' }
  });

  console.log(`Found ${menus.length} menus to migrate`);

  for (const menu of menus) {
    try {
      const filename = menu.imageUrl.split('/uploads/')[1];
      const filePath = path.join(__dirname, '../uploads', filename);
      
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        
        const result = await uploadToCloudinary(fileBuffer, {
          folder: 'menus',
          publicId: filename.split('.')[0]
        });
        
        await MenuDetails.findByIdAndUpdate(menu._id, {
          imageUrl: result.secure_url,
          imagePublicId: result.public_id
        });
        
        console.log(`✅ Migrated menu: ${menu.title}`);
      } else {
        console.log(`⚠️  File not found: ${filename}`);
      }
    } catch (error) {
      console.error(`❌ Failed to migrate menu ${menu._id}:`, error);
    }
  }
}

async function migrateCatalog() {
  console.log('🔄 Starting catalog images migration...');
  
  const items = await CatalogItem.find({
    imageUrl: { $regex: '/uploads/' }
  });

  console.log(`Found ${items.length} catalog items to migrate`);

  for (const item of items) {
    try {
      const filename = item.imageUrl.split('/uploads/')[1];
      const filePath = path.join(__dirname, '../uploads', filename);
      
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        
        const result = await uploadToCloudinary(fileBuffer, {
          folder: 'catalog',
          publicId: filename.split('.')[0]
        });
        
        await CatalogItem.findByIdAndUpdate(item._id, {
          imageUrl: result.secure_url,
          imagePublicId: result.public_id
        });
        
        console.log(`✅ Migrated catalog: ${item.category}`);
      } else {
        console.log(`⚠️  File not found: ${filename}`);
      }
    } catch (error) {
      console.error(`❌ Failed to migrate catalog ${item._id}:`, error);
    }
  }
}

async function migrateSliders() {
  console.log('🔄 Starting slider images migration...');
  
  const sliders = await SliderImage.find({
    src: { $regex: '/uploads/' }
  });

  console.log(`Found ${sliders.length} slider images to migrate`);

  for (const slider of sliders) {
    try {
      const filename = slider.src.split('/uploads/slider-images/')[1];
      const filePath = path.join(__dirname, '../uploads/slider-images', filename);
      
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        
        const result = await uploadToCloudinary(fileBuffer, {
          folder: 'slider-images',
          publicId: filename.split('.')[0]
        });
        
        await SliderImage.findByIdAndUpdate(slider._id, {
          src: result.secure_url,
          imagePublicId: result.public_id
        });
        
        console.log(`✅ Migrated slider: ${slider.title}`);
      } else {
        console.log(`⚠️  File not found: ${filename}`);
      }
    } catch (error) {
      console.error(`❌ Failed to migrate slider ${slider._id}:`, error);
    }
  }
}

async function runMigration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdb');
    console.log('📦 Connected to MongoDB');

    await migrateMenus();
    await migrateCatalog();
    await migrateSliders();

    console.log('✅ Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();