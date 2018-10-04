// flow-typed signature: 8d536e8389dea080519727800a6a0bda
// flow-typed version: <<STUB>>/tmp-cache_v1.0.0/flow_v0.81.0

declare module "tmp-cache" {
  /**
   * Aside from the items & changes mentioned below, tmp-cache extends the Map class, so all properties and methods are inherited.
   */
  declare class Cache<K, V> extends Map<K, V> {
    constructor(number): Cache<K, V>;
    /**
     * @param {number} options.max The maximum number of items the cache will hold. Adding more entries will force the oldest, least-recently-used item to be purged.
     * Failure to include any max restriction could potentially allow infinite unique entries! They will only be purged based on their expires value (if set).
     * Note: If options is an integer, then it is used as the options.max value.
     * @param {number} [maxAge=-1] The maximum age (in ms) an item is considered valid; aka, its lifespan.
     * Items are not pro-actively pruned out as they age, but if you try to access an item that has expired, it will be purged and, by default, result in an undefined response.
     * @param {boolean} [stale=false] Allow an expired/stale item's value to be returned before deleting it.
     */
    constructor({ max: number, maxAge?: number, stale?: boolean }): Cache<K, V>;
    /**
     * Return an item's value without updating its position or refreshing its expiration date.
     * May also return undefined if the item does not exist, or if it has expired & stale is not set.
     * @param {string} key The item's unique identifier.
     */
    peek(K): V | void;
    /**
     * Persists the item and its value into the Cache. If a maxAge value exists (via custom or cache-level options), an expiration date will also be stored.
     * When setting or updating an item that already exists, the original is removed. This allows the new item to be unique & the most recently used!
     * @param {string} key The item's unique identifier.
     * @param {mixed} value The item's value to cache.
     * @param {number} [maxAge=options.maxAge] Optionally override the `options.maxAge` for this (single) operation.
     */
    set(key: K, value: V, maxAge?: number): Cache<K, V>;
    /**
     * Retrieve an item's value by its key name. By default, this operation will refresh/update the item's expiration date.
     * May also return undefined if the item does not exist, or if it has expired & stale is not set.
     * @param {string} key The item's unique identifier.
     * @param {boolean} [mutate=true] Refresh the item's expiration date, marking it as more recently used.
     */
    get(key: K, mutate?: boolean): V | void;
  }
  declare module.exports: typeof Cache;
}
