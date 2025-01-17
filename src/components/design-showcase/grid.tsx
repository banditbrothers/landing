import { Design } from "@/data/designs";
import { DesignCard } from "./card";

interface DesignGridProps {
  designs: Design[];
  selectedDesignId: string | null;
  handleDesignClick: (design: Design) => void;
}

export const DesignGrid = ({ designs, selectedDesignId, handleDesignClick }: DesignGridProps) => {
  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {designs.map(design => (
          <div key={design.id} className="w-full h-full hover:scale-105 transition-transform duration-300">
            <DesignCard
              design={design}
              showRingAroundSelectedCard
              onClick={() => handleDesignClick(design)}
              selected={selectedDesignId === design.id}>
              <div className="flex flex-row w-full mt-4 px-1 justify-between items-center gap-6">
                <h3 className="text-xl font-semibold">{design.name}</h3>
                <p className="text-sm text-muted-foreground">₹{design.price}</p>
              </div>
            </DesignCard>
          </div>
        ))}
      </div>
    </div>
  );
};
