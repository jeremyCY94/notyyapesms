// databaseService.js
import * as SQLite from 'expo-sqlite';

export class DatabaseService {
    static database: any = null;

    static async initDatabase() {
        try {

            if (this.database) {
                return this.database
            }

            this.database = await SQLite.openDatabaseAsync('numbers.db');

            await this.database.execAsync(`
                PRAGMA journal_mode = WAL;
                CREATE TABLE IF NOT EXISTS numbers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                number_text TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);

            return this.database;
        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }

    static async getAllNumbers() {
        try {
            if (!this.database) {
                await this.initDatabase();
            }
            const allRows = await this.database.getAllAsync(
                'SELECT * FROM numbers ORDER BY created_at DESC;'
            );

            return allRows.map((item: any) => ({
                id: item.id.toString(),
                value: item.number_text,
                createdAt: item.created_at
            }));
        } catch (error) {
            console.error('Error getting numbers:', error);
            return [];
        }
    }

    static async addNumber(number: any) {
        if (!this.database) {
            await this.initDatabase();
        }
        await this.database.runAsync(
            'INSERT INTO numbers (number_text) VALUES (?);',
            [number]
        );
    }

    static async updateNumber(id: any, number: any) {
        if (!this.database) {
            await this.initDatabase();
        }
        await this.database.runAsync(
            'UPDATE numbers SET number_text = ? WHERE id = ?;',
            [number, parseInt(id)]
        );
    }

    static async deleteNumber(id: any) {
        if (!this.database) {
            await this.initDatabase();
        }
        await this.database.runAsync(
            'DELETE FROM numbers WHERE id = ?;',
            [parseInt(id)]
        );
    }

    static async deleteAllNumbers() {
        if (!this.database) {
            await this.initDatabase();
        }
        await this.database.runAsync('DELETE FROM numbers;');
    }
}