// server/scripts/migrateLocations.ts - COMPLETE PRODUCTION-READY VERSION
// Run: npx ts-node server/scripts/migrateLocations.ts

import mongoose from 'mongoose';
import Location from '../models/location';
import dotenv from 'dotenv';

dotenv.config();

// ✅ MongoDB URI Configuration
const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://kudrat:tiffinservice123@tiffin-service.knpde1h.mongodb.net/';

const migrateLocations = async () => {
  try {
    console.log('🚀 Starting Location Migration...\n');
    
    // ✅ Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: 'tiffin-service', // ✅ Specify database name
    });
    
    console.log('✅ Connected to MongoDB successfully!\n');
    
    // ✅ Find all locations without custom id
    const locations = await Location.find({ 
      $or: [
        { id: { $exists: false } },
        { id: null },
        { id: '' }
      ]
    });
    
    console.log(`📊 Found ${locations.length} location(s) without custom ID\n`);
    
    if (locations.length === 0) {
      console.log('✅ All locations already have custom IDs!');
      console.log('✅ No migration needed.\n');
      await mongoose.disconnect();
      process.exit(0);
    }
    
    // ✅ Display locations to be migrated
    console.log('📋 Locations to be migrated:');
    locations.forEach((loc, index) => {
      console.log(`   ${index + 1}. ${loc.name} (MongoDB _id: ${loc._id})`);
    });
    console.log('');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    // ✅ Process each location
    for (const location of locations) {
      try {
        // Generate base ID from name
        // Example: "Patna City Center" → "PATNA_CITY_CENTER"
        const baseId = location.name
          .toUpperCase()
          .replace(/\s+/g, '_')
          .replace(/[^A-Z0-9_]/g, '')
          .substring(0, 15);
        
        let customId = `${baseId}_001`;
        let counter = 1;
        
        // ✅ Check if ID already exists (avoid duplicates)
        while (await Location.findOne({ id: customId })) {
          counter++;
          customId = `${baseId}_${String(counter).padStart(3, '0')}`;
          
          // Safety check: prevent infinite loop
          if (counter > 999) {
            throw new Error(`Cannot generate unique ID for ${location.name}`);
          }
        }
        
        // ✅ Update location with custom ID
        location.id = customId;
        await location.save();
        
        updatedCount++;
        console.log(`✅ Updated: "${location.name}" → ${customId}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating "${location.name}":`, error instanceof Error ? error.message : error);
      }
    }
    
    // ✅ Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Locations Found:    ${locations.length}`);
    console.log(`✅ Successfully Updated:   ${updatedCount}`);
    console.log(`❌ Failed to Update:      ${errorCount}`);
    console.log('='.repeat(50) + '\n');
    
    if (errorCount === 0) {
      console.log('🎉 Migration completed successfully!');
    } else {
      console.log('⚠️  Migration completed with some errors.');
    }
    
    // ✅ Verify migration
    console.log('\n📋 Verifying migration...');
    const remainingWithoutId = await Location.countDocuments({ 
      $or: [
        { id: { $exists: false } },
        { id: null },
        { id: '' }
      ]
    });
    
    if (remainingWithoutId === 0) {
      console.log('✅ Verification successful: All locations have custom IDs!');
    } else {
      console.log(`⚠️  Warning: ${remainingWithoutId} location(s) still without custom ID`);
    }
    
    // ✅ Display all locations with their new IDs
    console.log('\n📋 All Locations After Migration:');
    const allLocations = await Location.find({}).sort({ name: 1 });
    allLocations.forEach((loc, index) => {
      console.log(`   ${index + 1}. ${loc.name.padEnd(30)} | ID: ${loc.id || 'N/A'}`);
    });
    
    console.log('\n✅ Migration script finished!\n');
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error instanceof Error ? error.message : error);
    console.error('Stack Trace:', error);
    
    try {
      await mongoose.disconnect();
      console.log('👋 Disconnected from MongoDB\n');
    } catch (disconnectError) {
      console.error('Error disconnecting:', disconnectError);
    }
    
    process.exit(1);
  }
};

// ✅ Run migration
console.log('🔧 Location ID Migration Script');
console.log('================================\n');

migrateLocations();