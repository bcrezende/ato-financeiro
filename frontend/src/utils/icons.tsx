import {
  Tag, Home, Car, Utensils, Heart, Book, Smile, ShoppingBag, FileText,
  Briefcase, Laptop, TrendingUp, PlusCircle, Coffee, Music, Gift, Globe,
  Star, Zap, DollarSign, CreditCard, Plane, Baby, Dumbbell, Tv,
  Wifi, ShoppingCart, Fuel, Pill, GraduationCap, Building,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  tag: Tag,
  home: Home,
  car: Car,
  utensils: Utensils,
  heart: Heart,
  book: Book,
  smile: Smile,
  'shopping-bag': ShoppingBag,
  'file-text': FileText,
  briefcase: Briefcase,
  laptop: Laptop,
  'trending-up': TrendingUp,
  'plus-circle': PlusCircle,
  coffee: Coffee,
  music: Music,
  gift: Gift,
  globe: Globe,
  star: Star,
  zap: Zap,
  'dollar-sign': DollarSign,
  'credit-card': CreditCard,
  plane: Plane,
  baby: Baby,
  dumbbell: Dumbbell,
  tv: Tv,
  wifi: Wifi,
  'shopping-cart': ShoppingCart,
  fuel: Fuel,
  pill: Pill,
  'graduation-cap': GraduationCap,
  building: Building,
};

interface CategoryIconProps {
  icon: string;
  color?: string;
  size?: number;
  className?: string;
}

export const CategoryIcon = ({ icon, color, size = 18, className = '' }: CategoryIconProps) => {
  const Icon = iconMap[icon] ?? Tag;
  return <Icon size={size} color={color ?? 'currentColor'} className={className} />;
};

export const CategoryAvatar = ({
  icon, color, size = 'md', name,
}: { icon: string; color: string; size?: 'sm' | 'md' | 'lg'; name?: string }) => {
  const Icon = iconMap[icon] ?? Tag;
  const sizes = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-11 h-11' };
  const iconSizes = { sm: 14, md: 16, lg: 20 };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center flex-shrink-0`}
      style={{ backgroundColor: color }}
      title={name}
    >
      <Icon size={iconSizes[size]} color="#ffffff" />
    </div>
  );
};

export const AVAILABLE_ICONS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: 'tag', label: 'Etiqueta', Icon: Tag },
  { value: 'home', label: 'Casa', Icon: Home },
  { value: 'car', label: 'Carro', Icon: Car },
  { value: 'utensils', label: 'Alimentação', Icon: Utensils },
  { value: 'heart', label: 'Saúde', Icon: Heart },
  { value: 'book', label: 'Livro', Icon: Book },
  { value: 'smile', label: 'Lazer', Icon: Smile },
  { value: 'shopping-bag', label: 'Compras', Icon: ShoppingBag },
  { value: 'file-text', label: 'Contas', Icon: FileText },
  { value: 'briefcase', label: 'Trabalho', Icon: Briefcase },
  { value: 'laptop', label: 'Tecnologia', Icon: Laptop },
  { value: 'trending-up', label: 'Investimento', Icon: TrendingUp },
  { value: 'plus-circle', label: 'Outros', Icon: PlusCircle },
  { value: 'coffee', label: 'Café', Icon: Coffee },
  { value: 'music', label: 'Música', Icon: Music },
  { value: 'gift', label: 'Presente', Icon: Gift },
  { value: 'globe', label: 'Viagem', Icon: Globe },
  { value: 'star', label: 'Destaque', Icon: Star },
  { value: 'zap', label: 'Energia', Icon: Zap },
  { value: 'credit-card', label: 'Cartão', Icon: CreditCard },
  { value: 'plane', label: 'Viagem', Icon: Plane },
  { value: 'dumbbell', label: 'Academia', Icon: Dumbbell },
  { value: 'tv', label: 'Entretenimento', Icon: Tv },
  { value: 'shopping-cart', label: 'Mercado', Icon: ShoppingCart },
  { value: 'pill', label: 'Remédio', Icon: Pill },
  { value: 'graduation-cap', label: 'Educação', Icon: GraduationCap },
];
