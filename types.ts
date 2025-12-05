export type Language = 'en' | 'id';

export interface User {
  username: string;
  points: number;
  streak: number;
  commitments: string[];
}

export interface WasteEntry {
  category: string;
  amount: number; // in grams
  cost: number; // estimated
  co2: number; // estimated
}

export interface Recipe {
  title: string;
  ingredients: string[];
  steps: string[];
  emoji: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export enum View {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  CALCULATOR = 'CALCULATOR',
  RECIPES = 'RECIPES',
  QUIZ = 'QUIZ',
  COMMITMENT = 'COMMITMENT'
}

export const LOGO_URL = "https://i.ibb.co/30Z37qR/eco-bite-logo.png"; // Placeholder for the user's uploaded image logic
