import { useState, useCallback } from 'react';
import { ProductFilter } from 'models';
import { ProductFilterGroup } from 'components';
import { toArray, flatArrByValue } from 'utils/helpers';

interface Props {
  onFilterClick: (filters: string[]) => void;
}

const initialFilters: Record<string, ProductFilter> = {
  drax22: { id: 'drax22', value: false, label: 'Draxon SA-22' },
  cygf35: { id: 'cygf35', value: false, label: 'Cygnia F35' },
  hamm2: { id: 'hamm2', value: false, label: 'Hammerhead 2' },
  vanguard: { id: 'vanguard', value: false, label: 'Vanguard SAR' },
  tellrx5: { id: 'tellrx5', value: false, label: 'Tellus R X5' }
};

const SpacecraftFilter = (props: Props) => {
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
      title="spacecrafts"
      filters={toArray(filters)}
      onFilterClick={handleFilterClick}
    />
  );
};

export default SpacecraftFilter;
