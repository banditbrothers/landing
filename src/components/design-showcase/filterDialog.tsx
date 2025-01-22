import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DesignColors, designColors, DesignPattern, designPatterns, designPatternsObject } from "@/data/designs";
import { ColorBadge } from "../product/badges";

export interface FilterState {
  colors: DesignColors[];
  patterns: DesignPattern[];
}

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: FilterState) => void;
  defaultFilters: FilterState;
}

const COLORS = designColors.map(color => color.id);
const PATTERNS = designPatterns.map(pattern => pattern.id);

export const FilterDialog = ({ open, onOpenChange, onApplyFilters, defaultFilters }: FilterDialogProps) => {
  const [selectedColors, setSelectedColors] = useState<DesignColors[]>(defaultFilters.colors);
  const [selectedPatterns, setSelectedPatterns] = useState<DesignPattern[]>(defaultFilters.patterns);

  useEffect(() => {
    setSelectedColors(defaultFilters.colors);
    setSelectedPatterns(defaultFilters.patterns);
  }, [defaultFilters]);

  const handleToggleColor = (colorId: DesignColors) => {
    setSelectedColors(prev => (prev.includes(colorId) ? prev.filter(c => c !== colorId) : [...prev, colorId]));
  };

  const handleTogglePattern = (patternId: DesignPattern) => {
    setSelectedPatterns(prev => (prev.includes(patternId) ? prev.filter(p => p !== patternId) : [...prev, patternId]));
  };

  const handleApply = () => {
    onApplyFilters({ colors: selectedColors, patterns: selectedPatterns });
    onOpenChange(false);
  };

  const handleReset = () => {
    setSelectedColors([]);
    setSelectedPatterns([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Designs</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Patterns</h4>
            {selectedPatterns.length > 0 && <Badge variant="secondary">{selectedPatterns.length} selected</Badge>}
          </div>
          <ScrollArea className="max-h-32">
            <div className="flex flex-wrap gap-2">
              {PATTERNS.map(pattern => (
                <button key={pattern} onClick={() => handleTogglePattern(pattern)}>
                  <Badge variant={selectedPatterns.includes(pattern) ? "default" : "outline"}>
                    {designPatternsObject[pattern].name}
                  </Badge>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Colors</h4>
              {selectedColors.length > 0 && <Badge variant="secondary">{selectedColors.length} selected</Badge>}
            </div>
            <ScrollArea className="max-h-32">
              <div className="flex flex-wrap gap-2">
                {COLORS.map(color => (
                  <button key={color} onClick={() => handleToggleColor(color)}>
                    <ColorBadge color={color} variant={selectedColors.includes(color) ? "default" : "outline"} />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-2">
          <Button variant="outline" onClick={handleReset} disabled={!selectedColors.length && !selectedPatterns.length}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
