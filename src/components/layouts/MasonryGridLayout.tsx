export const MasonryGridLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="columns-1 md:columns-2 lg:columns-3 gap-4 ">{children}</div>;
};

export const MasonryGridItem = ({ children }: { children: React.ReactNode }) => {
  return <div className="break-inside-avoid mb-4 w-full">{children}</div>;
};
