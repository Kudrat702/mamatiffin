import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/user';
import Address from '../models/address';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (userId: string): string => {
  const payload = { id: userId };

  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

// SignUp Controller
export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, address, password } = req.body;

    // Validate required fields
    if (!name || !phone || !password || !address) {
      res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
      return;
    }

    // Validate address fields
    if (!address.district || !address.block || !address.city || !address.homeLodgeName) {
      res.status(400).json({
        success: false,
        message: 'All address fields are required'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this phone number already exists'
      });
      return;
    }

    // Create new user
    const user: IUser = new User({
      name,
      phone,
      address: {
        district: address.district,
        block: address.block,
        city: address.city,
        homeLodgeName: address.homeLodgeName
      },
      password
    });

    await user.save();

    // Generate JWT token
    const token = generateToken((user._id as string).toString());

    // Return user data without password
    const userResponse = {
      id: user._id,
      name: user.name,
      phone: user.phone,
      address: user.address,
      role: user.role
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error: any) {
    console.error('SignUp Error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
      return;
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'Phone number already exists'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// SignIn Controller
export const signIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password } = req.body;

    // Validate required fields
    if (!phone || !password) {
      res.status(400).json({
        success: false,
        message: 'Phone number and password are required'
      });
      return;
    }

    // Find user by phone
    const user = await User.findOne({ phone }) as (IUser & { _id: string }) | null;
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Return user data without password
    const userResponse = {
      id: user._id,
      name: user.name,
      phone: user.phone,
      address: user.address,
      role: user.role
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('SignIn Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get Address Options Controller
export const getAddressOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const addresses = await Address.find({});
    
    // If no addresses exist, create default data
    if (addresses.length === 0) {
      const defaultAddresses = [
        {
          district: 'Hazaribagh',
          blocks: ['Hazaribagh Sadar'],
          cities: ['Monday Khurd', 'Monday kalan', 'Kolghatti', 'Nora','Pugmil', 'Pelawal', 'Okni', 'Kallu Chowk', 'Matwari','Babu gaon',
                     'Korah','Jabra','Amrit Nagar', 'Lakhe', 'Jhinjhariya Pull', 'Dipugarha', 'Khirgaon', 'Kumartuli', 'Baba Path', 'Nawabganj','Markham Collage',
                     'Sindoor', 'Shipuri', 'Chanu', 'Dewangna', 'Dvc Colony', 'Huhuru'
          ],
          homeLodgeNames: ['Home','Hostel','Lodge']
        },
        // {
        //   district: 'Gaya',
        //   blocks: ['Gaya Sadar', 'Manpur', 'Tekari', 'Sherghati'],
        //   cities: ['Gaya City', 'Bodh Gaya', 'Manpur', 'Sherghati'],
        //   homeLodgeNames: ['Home', 'PG', 'Hostel', 'Guest House', 'Lodge']
        // }
      ];

      await Address.insertMany(defaultAddresses);
      
      res.status(200).json({
        success: true,
        data: defaultAddresses
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: addresses
    });

  } catch (error) {
    console.error('Get Address Options Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, { password: 0 }); // password ko exclude kiya
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};