export type Brand<T, B extends string> = T & { __brand: B }

export type FieldId = Brand<string, 'FieldId'>

export type DataKey = Brand<string, 'DataKey'>