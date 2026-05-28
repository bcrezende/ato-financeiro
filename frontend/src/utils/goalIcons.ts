import {
  Target, Trophy, Star, Rocket, Plane, Home, Car, Heart,
  Briefcase, GraduationCap, Dumbbell, PiggyBank, Gift, Mountain,
  Camera, Music,
} from 'lucide-react';

export const GOAL_ICONS = [
  { name: 'target', icon: Target },
  { name: 'trophy', icon: Trophy },
  { name: 'star', icon: Star },
  { name: 'rocket', icon: Rocket },
  { name: 'plane', icon: Plane },
  { name: 'home', icon: Home },
  { name: 'car', icon: Car },
  { name: 'heart', icon: Heart },
  { name: 'briefcase', icon: Briefcase },
  { name: 'graduation', icon: GraduationCap },
  { name: 'dumbbell', icon: Dumbbell },
  { name: 'piggy', icon: PiggyBank },
  { name: 'gift', icon: Gift },
  { name: 'mountain', icon: Mountain },
  { name: 'camera', icon: Camera },
  { name: 'music', icon: Music },
];

export const GOAL_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
  '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#a855f7',
];

export const getGoalIcon = (name: string) =>
  GOAL_ICONS.find((g) => g.name === name)?.icon ?? Target;
