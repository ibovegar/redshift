import React, { useState, useCallback } from 'react';
import { ProductFilter } from 'models';
import { ProductFilterGroup } from 'components';
import { toArray, flatArrByValue } from 'utils/helpers';

interface Props {
  onFilterClick: (filters: string[]) => void;
}

const initialFilters: Record<string, ProductFilter> = {
  spacecraft: { id: 'spacecraft', value: false, label: 'Spacecraft' },
  engine: { id: 'engine', value: false, label: 'Engine' },
  plating: { id: 'plating', value: false, label: 'Plating' },
  deflector: { id: 'deflector', value: false, label: 'Deflector' },
  weapons: { id: 'weapons', value: false, label: 'Weapons' },
  stabilizer: { id: 'stabilizer', value: false, label: 'Stabilizer' }
};

const StoreTypeFilter = (props: Props) => {
  const { onFilterClick } = props;

  const [filters, setFilters] = useState(initialFilters);

  const handleFilterClick = useCallback(
    (filter: ProductFilter) => {
      setFilters((prev) => {
        const next = {
          ...prev,
          [filter.id]: { ...prev[filter.id], value: !prev[filter.id].value }
        };
        const arr: ProductFilter[] = toArray(next);
        onFilterClick(flatArrByValue(arr, 'value', 'id'));
        return next;
      });
    },
    [onFilterClick]
  );

  return (
    <ProductFilterGroup
      title="Product category"
      filters={toArray(filters)}
      onFilterClick={handleFilterClick}
    />
  );
};

export default StoreTypeFilter;
