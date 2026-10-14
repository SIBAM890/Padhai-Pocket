// Minimal type declarations for expo-sqlite.
// Replace with official types if the package ships them.
declare module 'expo-sqlite' {
  export interface SQLiteDatabase {
    execAsync(sql: string): Promise<void>;
    runAsync(sql: string, ...params: any[]): Promise<void>;
    getFirstAsync<T>(sql: string, ...params: any[]): Promise<T | null>;
    getAllAsync<T>(sql: string, ...params: any[]): Promise<T[]>;
    closeAsync(): Promise<void>;
  }

  export function openDatabaseAsync(name: string): Promise<SQLiteDatabase>;

  const SQLite: {
    openDatabaseAsync: typeof openDatabaseAsync;
  };

  export default SQLite;
}