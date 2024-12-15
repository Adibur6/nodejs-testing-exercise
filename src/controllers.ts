import { Request, Response } from 'express';
import User from './models';

export const getUsers = async (_req: Request, res: Response)=> {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user){
        res.status(404).json({ error: 'User not found' });
        return ;

    }
    res.status(200).json(user);
  } catch (err:any) {
    res.status(500).json({ error: err.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
    const { name, email } = req.body;
    if (!name || !email) {
        res.status(400).json({ error: 'Name and email are required' });
        return 
    }
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
        
        res.status(404).json({ error: 'User not found' });
        return ; 
    }
    res.status(200).json(updatedUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
        res.status(404).json({ error: 'User not found' });
        return ;
    }
    res.status(204).json();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};