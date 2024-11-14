/**
 * A value that can be inserted into the database.
 */
export type DatabaseValue = undefined | number | string

/**
 * An interface for converting rich types into database insertable values.
 */
export interface DatabaseValueConvertible {
  /**
   * Returns an {@link DatabaseValue} for instance.
   */
  toDatabaseValue(): DatabaseValue
}
