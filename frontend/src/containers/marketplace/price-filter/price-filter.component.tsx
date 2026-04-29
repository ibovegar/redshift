import { ProductFilterGroup } from 'components'
import type { ProductFilter } from 'models'
import { useCallback, useState } from 'react'
import { toArray } from 'utils/helpers'

interface Props {
  onFilterClick: (filters: ProductFilter[]) => void
}

const initialFilters: Record<string, ProductFilter> = {
  100: { id: '100', value: false, label: '0-100' },
  500: { id: '500', value: false, label: '100-500' },
  1000: { id: '1000', value: false, label: '500-1000' },
  2000: { id: '2000', value: false, label: '1000-2000' }
}

const PriceFilter = (props: Props) => {
  const { onFilterClick } = props

  const [filters, setFilters] = useState(initialFilters)

  const handleFilterClick = useCallback(
    (filter: ProductFilter) => {
      setFilters((prev) => {
        const next = {
          ...prev,
          [filter.id]: { ...prev[filter.id], value: !prev[filter.id].value }
        }
        onFilterClick(toArray(next))
        return next
      })
    },
    [onFilterClick]
  )

  return <ProductFilterGroup title="Product category" filters={toArray(filters)} onFilterClick={handleFilterClick} />
}

export default PriceFilter
