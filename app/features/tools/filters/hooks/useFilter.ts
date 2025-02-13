import { useState, useCallback } from "react";
import { FilterName } from "../shaders/FilterShader";

export const useFilter = () => {
  const [intensity, setIntensity] = useState(100);
  const [selectedFilter, setSelectedFilter] = useState<FilterName>("normal");

  const updateFilter = useCallback((filterName: FilterName, value: number) => {
    setSelectedFilter(filterName);
    setIntensity(value * 100);
  }, []);

  return {
    intensity,
    selectedFilter,
    updateFilter,
  };
};
