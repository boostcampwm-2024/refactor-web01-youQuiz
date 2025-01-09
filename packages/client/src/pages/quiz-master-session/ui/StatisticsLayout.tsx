interface StatisticsLayoutProps {
  children: React.ReactNode;
}

export default function StatisticsLayout({ children }: StatisticsLayoutProps) {
  return (
    <div className="grid grid-cols-[3fr_1fr] gap-4 mx-5 h-[calc(100vh-300px)]">{children}</div>
  );
}
