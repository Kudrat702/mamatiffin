// scripts/migrateMenuData.ts - FIXED VERSION
import mongoose from 'mongoose';
import { MenuDetails } from '../models/menuDetails'; // New model
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Old data structure (if you still have the old model)
interface OldMenuData {
  _id: mongoose.Types.ObjectId;
  dietaryPreference: 'veg' | 'non-veg';
  mealCategory: string;
  imageUrl: string;
  description: string;
  deliveryTime: string;
  price: number;
  weeklyMenu: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Mapping for meal categories
const mealCategoryMapping: { [key: string]: string } = {
  'breakfast': 'Breakfast',
  'lunch': 'Lunch',
  'dinner': 'Dinner',
  'breakfast-lunch': 'Breakfast + Lunch',
  'breakfast-dinner': 'Breakfast + Dinner',
  'lunch-dinner': 'Lunch + Dinner',
  'breakfast-lunch-dinner': 'Breakfast + Lunch + Dinner'
};

// FIXED: Function to convert weekly menu from object to array format
const convertWeeklyMenu = (oldWeeklyMenu: OldMenuData['weeklyMenu']) => {
  const processMenuItem = (menuString: string): string => {
    return menuString
      ? menuString.split(',').map((item: string) => item.trim()).filter((item: string) => item.length > 0).join(', ')
      : 'No items available';
  };

  // Convert object format to array format
  return [
    { day: 'Monday', items: processMenuItem(oldWeeklyMenu.monday) },
    { day: 'Tuesday', items: processMenuItem(oldWeeklyMenu.tuesday) },
    { day: 'Wednesday', items: processMenuItem(oldWeeklyMenu.wednesday) },
    { day: 'Thursday', items: processMenuItem(oldWeeklyMenu.thursday) },
    { day: 'Friday', items: processMenuItem(oldWeeklyMenu.friday) },
    { day: 'Saturday', items: processMenuItem(oldWeeklyMenu.saturday) },
    { day: 'Sunday', items: processMenuItem(oldWeeklyMenu.sunday) }
  ];
};

// Function to generate title from meal category
const generateTitle = (mealCategory: string, dietaryPreference: string): string => {
  const categoryName = mealCategoryMapping[mealCategory] || mealCategory;
  const dietType = dietaryPreference === 'veg' ? 'Vegetarian' : 'Non-Vegetarian';
  return `${dietType} ${categoryName} Menu`;
};

// Migration function
export const migrateMenuData = async (): Promise<void> => {
  try {
    console.log('Starting menu data migration...');

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name');
      console.log('Connected to MongoDB');
    }

    // Get old collection directly from MongoDB
    const db = mongoose.connection.db;
    const oldMenusCollection = db?.collection('menus'); // Replace 'menus' with your old collection name

    if (!oldMenusCollection) {
      throw new Error('Could not access old menus collection');
    }

    // Fetch all old menu documents
    const oldMenus = await oldMenusCollection.find({}).toArray() as OldMenuData[];
    console.log(`Found ${oldMenus.length} old menu documents to migrate`);

    if (oldMenus.length === 0) {
      console.log('No old menu data found. Migration not needed.');
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const oldMenu of oldMenus) {
      try {
        // Convert old data to new structure
        const newMenuData = {
          category: oldMenu.dietaryPreference,
          menuType: mealCategoryMapping[oldMenu.mealCategory] || oldMenu.mealCategory,
          title: generateTitle(oldMenu.mealCategory, oldMenu.dietaryPreference),
          description: oldMenu.description,
          imageUrl: oldMenu.imageUrl,
          deliveryTime: oldMenu.deliveryTime,
          priceMonthly: oldMenu.price,
          priceTrial: Math.round(oldMenu.price * 0.6), // FIXED: 60% like frontend logic
          weeklyMenu: convertWeeklyMenu(oldMenu.weeklyMenu), // FIXED: Now returns array format
          catalogItemId: undefined // Will be set when catalog integration is implemented
        };

        // Check if this menu already exists in new structure
        const existingMenu = await MenuDetails.findOne({
          category: newMenuData.category,
          menuType: newMenuData.menuType
        });

        if (existingMenu) {
          console.log(`Menu already exists: ${newMenuData.category} ${newMenuData.menuType} - Skipping`);
          skippedCount++;
          continue;
        }

        // Create new menu document
        const newMenu = new MenuDetails(newMenuData);
        await newMenu.save();

        console.log(`Migrated: ${newMenuData.category} ${newMenuData.menuType}`);
        migratedCount++;

      } catch (error) {
        console.error(`Error migrating menu ${oldMenu._id}:`, error);
        errorCount++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total old menus found: ${oldMenus.length}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Skipped (already exists): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('Migration completed!');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Rollback function (optional)
export const rollbackMigration = async (): Promise<void> => {
  try {
    console.log('Starting rollback...');
    
    // This will delete all documents from the new MenuDetails collection
    const result = await MenuDetails.deleteMany({});
    console.log(`Rollback completed. Deleted ${result.deletedCount} documents from MenuDetails collection.`);
    
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
};

// FIXED: Validation function to check migration success
export const validateMigration = async (): Promise<void> => {
  try {
    console.log('Validating migration...');

    const newMenusCount = await MenuDetails.countDocuments();
    console.log(`New MenuDetails collection has ${newMenusCount} documents`);

    // Check for each category and menuType combination
    const vegMenus = await MenuDetails.find({ category: 'veg' });
    const nonVegMenus = await MenuDetails.find({ category: 'non-veg' });

    console.log(`Veg menus: ${vegMenus.length}`);
    console.log(`Non-veg menus: ${nonVegMenus.length}`);

    // Validate data structure
    const sampleMenu = await MenuDetails.findOne();
    if (sampleMenu) {
      console.log('Sample migrated menu structure:');
      console.log({
        category: sampleMenu.category,
        menuType: sampleMenu.menuType,
        title: sampleMenu.title,
        priceMonthly: sampleMenu.priceMonthly,
        priceTrial: sampleMenu.priceTrial,
        // FIXED: Access array elements since weeklyMenu is an array
        weeklyMenuLength: sampleMenu.weeklyMenu.length,
        weeklyMenuSample: {
          firstDay: sampleMenu.weeklyMenu[0],
          secondDay: sampleMenu.weeklyMenu[1]
        }
      });
    }

    console.log('Validation completed successfully!');

  } catch (error) {
    console.error('Validation failed:', error);
    throw error;
  }
};

// CLI execution
if (require.main === module) {
  const command = process.argv[2];

  (async () => {
    try {
      switch (command) {
        case 'migrate':
          await migrateMenuData();
          break;
        case 'rollback':
          await rollbackMigration();
          break;
        case 'validate':
          await validateMigration();
          break;
        default:
          console.log('Usage:');
          console.log('npm run migrate:menu migrate   - Run migration');
          console.log('npm run migrate:menu rollback  - Rollback migration');
          console.log('npm run migrate:menu validate  - Validate migration');
      }
    } catch (error) {
      console.error('Script failed:', error);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
  })();
}