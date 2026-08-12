import mongoose, { Schema, Document } from 'mongoose';

// Location Interface & Schema
export interface ILocation extends Document {
  id: string;
  name: string;
  category: string;
  description?: string;
  coordinates: { x: number; y: number };
  image?: string;
  tags?: string[];
  aliases?: string[];
  facilities?: string[];
  block?: string;
  floorCount?: number;
  nodeId: string;
}

const LocationSchema = new Schema<ILocation>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  coordinates: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  image: { type: String },
  tags: [{ type: String }],
  aliases: [{ type: String }],
  facilities: [{ type: String }],
  block: { type: String },
  floorCount: { type: Number },
  nodeId: { type: String, required: true },
}, { timestamps: true });

// Category Schema
export interface ICategory extends Document {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const CategorySchema = new Schema<ICategory>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  description: { type: String },
  color: { type: String, required: true },
});

// Navigation Graph Node Schema
export interface INavigationNode extends Document {
  nodeId: string;
  name: string;
  x: number;
  y: number;
}

const NavigationNodeSchema = new Schema<INavigationNode>({
  nodeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
});

// Navigation Graph Edge Schema
export interface INavigationEdge extends Document {
  edgeId: string;
  from: string;
  to: string;
  distance: number;
  roadName?: string;
}

const NavigationEdgeSchema = new Schema<INavigationEdge>({
  edgeId: { type: String, required: true, unique: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  distance: { type: Number, required: true },
  roadName: { type: String },
});

export const LocationModel = mongoose.model<ILocation>('Location', LocationSchema);
export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);
export const NavigationNodeModel = mongoose.model<INavigationNode>('NavigationNode', NavigationNodeSchema);
export const NavigationEdgeModel = mongoose.model<INavigationEdge>('NavigationEdge', NavigationEdgeSchema);
