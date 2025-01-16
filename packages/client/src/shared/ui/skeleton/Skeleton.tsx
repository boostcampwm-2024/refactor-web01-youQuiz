interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  const baseClass = 'animate-pulse bg-gray-200';
  return <div className={`${baseClass} ${className}`} />;
}
