/**
 * Convert an array of object into an object of enitites.
 * Keyfield spesifies the object keys, e.g. keyfield = id:
 *
 *  [{ id: "123", someProp: "value" }]
 * becomes
 * { "123": { id: "123", someProp: "value" }}
 */
export const toEntities = <T extends object>(array: T[], keyField: string): Record<string, T> => {
  return array.reduce<Record<string, T>>((obj, item) => {
    obj[(item as Record<string, string>)[keyField]] = item
    return obj
  }, {})
}

/**
 * Convert an object of entities into an object array.
 *
 * { "123": { id: "123", someProp: "value" }}
 * becomes
 * [{ id: "123", someProp: "value" }]
 */
export const toArray = <T>(obj: Record<string, T>): T[] => {
  return Object.values(obj)
}

/**
 * Check if an object is empty or not. Return true if empty.
 */
export const isEmpty = (obj: object): boolean => {
  return Object.entries(obj).length === 0 && obj.constructor === Object
}

/**
 * Add new and update existing entities.
 */
export const upsertEntities = <T>(
  currentEntities: Record<string, T>,
  incomingEntities: Record<string, T>
): Record<string, T> => {
  const newEntities: Record<string, T> = { ...currentEntities }
  return {
    ...newEntities,
    ...incomingEntities
  }
}

/**
 * Calculate ascpect ratio of a html element.
 */
export const getAspectRatio = (element: HTMLElement) => {
  const height = element.clientHeight
  if (height === 0) return 0
  return element.clientWidth / element.clientHeight
}

/**
 * Calculate ascpect ratio of a html element.
 */
export const formatCurrency = (value: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  })

  return formatter.format(value)
}

/**
 * Filter an object array by an array of string
 * @example
 * const source = [
 *  { key1: val1, key2: val2 },
 *  { key1: val3, key2: val4 }
 * ]
 * const filter = ['val1', 'val5']
 * const filtered = filterObjArr(source, filter, 'key1'); // => [{ key1: val1, key2: val2 }]
 */
export function filterObjArr<T>(source: T[], filter: string[], key: keyof T): T[] {
  if (filter && filter.length === 0) return source
  return source.filter((obj: T) => filter.includes(String(obj[key])))
}

/**
 * Convert an object array to a flattened array of keys.
 * Returned keys are blah blah
 *
 * @param arr Lorem ipsum dolor sit amet
 * @param filterKey Lorem ipsum dolor sit amet
 * @param returnKey Lorem ipsum dolor sit amet
 * @returns Lorem ipsum dolor sit amet
 * @example
 * const arr: [
 *   { id: 'id1', value: false },
 *   { id: 'id2', value: true },
 *   { id: 'id3', value: true }
 * ]
 * const filters = flatArrByValue(arr, 'value', 'id'); // => ['id2', 'id3']
 */
export function flatArrByValue<T, K extends keyof T>(arr: T[], filterKey: keyof T, returnKey: K): T[K][] {
  // TODO: typedef return value 'id'[]
  return arr.filter((filter: T) => filter[filterKey]).map((filter: T) => filter[returnKey])
}

export default {
  toEntities,
  toArray,
  upsertEntities,
  getAspectRatio,
  filterObjArr,
  flatArrByValue,
  formatCurrency
}
