import { Schema, model } from 'mongoose';

export interface IUser {
  username: string;
  password?: string;
  role: 'Chief Minister' | 'District Magistrate' | 'Department Head';
  district?: string;
  department?: string;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['Chief Minister', 'District Magistrate', 'Department Head'],
      required: true
    },
    district: {
      type: String,
      required: false
    },
    department: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
);

export const User = model<IUser>('User', userSchema);
