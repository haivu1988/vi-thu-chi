import React from 'react';
import {
  Utensils,
  Home,
  ShoppingBag,
  Car,
  Film,
  HeartPulse,
  GraduationCap,
  Users,
  MoreHorizontal,
  Briefcase,
  Award,
  TrendingUp,
  Gift,
  Coins,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  iconName: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, ...props }) => {
  switch (iconName) {
    case 'Utensils':
      return <Utensils {...props} />;
    case 'Home':
      return <Home {...props} />;
    case 'ShoppingBag':
      return <ShoppingBag {...props} />;
    case 'Car':
      return <Car {...props} />;
    case 'Film':
      return <Film {...props} />;
    case 'HeartPulse':
      return <HeartPulse {...props} />;
    case 'GraduationCap':
      return <GraduationCap {...props} />;
    case 'Users':
      return <Users {...props} />;
    case 'Briefcase':
      return <Briefcase {...props} />;
    case 'Award':
      return <Award {...props} />;
    case 'TrendingUp':
      return <TrendingUp {...props} />;
    case 'Gift':
      return <Gift {...props} />;
    case 'Coins':
      return <Coins {...props} />;
    case 'MoreHorizontal':
    default:
      return <MoreHorizontal {...props} />;
  }
};
