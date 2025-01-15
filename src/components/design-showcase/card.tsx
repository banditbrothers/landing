import Image from "next/image";
import { Design } from "@/data/designs";

interface DesignCardProps {
  design: Design;
  onClick: () => void;
  selected: boolean;
  showRingAroundSelectedCard?: boolean;
  children: React.ReactNode;
}

export const DesignCard = ({
  design,
  onClick,
  selected,
  children,
  showRingAroundSelectedCard = false,
}: DesignCardProps) => {
  return (
    <div className="w-full h-full">
      <div className={`p-4 bg-card rounded-xl ${showRingAroundSelectedCard && selected ? "ring-2 ring-primary" : ""}`}>
        <button onClick={onClick} className="w-full h-full">
          <div>
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square">
                <Image fill src={design.image} alt={design.name} className="object-cover rounded-xl" />
              </div>
              {children}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
