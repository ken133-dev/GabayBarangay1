import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Runs a PostgreSQL pg_dump command to back up the entire database.
 * @param outputDir Directory to save the backup file
 * @param dbUrl The PostgreSQL connection string
 * @returns Promise<{ filePath: string, fileSize: number }>
 */
export function createPostgresBackup(outputDir: string, dbUrl: string): Promise<{ filePath: string, fileSize: number }> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup_${timestamp}.sql`;
    const filePath = path.join(outputDir, fileName);

    // Remove protocol for pg_dump
    const pgDumpUrl = dbUrl.replace('postgresql://', '');
    // Parse connection string
    const match = pgDumpUrl.match(/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!match) {
      return reject(new Error('Invalid DATABASE_URL format for pg_dump'));
    }
    const [, user, password, host, port, db] = match;

    // Set env for password
    const env = { ...process.env, PGPASSWORD: password };
    const cmd = `pg_dump -h ${host} -p ${port} -U ${user} -F p -d ${db} -f "${filePath}"`;

    exec(cmd, { env }, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      fs.stat(filePath, (err, stats) => {
        if (err) return reject(err);
        resolve({ filePath, fileSize: stats.size });
      });
    });
  });
}
