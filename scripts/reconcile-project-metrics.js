#!/usr/bin/env node
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];
if (!DATABASE_URL) {
  console.error('DATABASE_URL not provided. Usage: DATABASE_URL="postgresql://..." node reconcile-project-metrics.js');
  process.exit(1);
}

const approvedStatuses = ['completed','success','paid','authorized','captured','approved'];

const client = new Client({ connectionString: DATABASE_URL });

const safeQuery = async (text, params=[]) => {
  const res = await client.query(text, params);
  return res;
};

const main = async () => {
  try {
    await client.connect();

    // Read current metrics
    const metricsRes = await safeQuery("SELECT id, name, collectedAmount, investedAmount, updatedAt FROM project_metrics WHERE id = $1", ['default_project']);
    const metricsRow = metricsRes.rows[0] || null;

    // Compute approved summary
    const placeholders = approvedStatuses.map((_, i) => `$${i+1}`).join(',');
    const sql = `SELECT COUNT(*) AS investorcount, COALESCE(SUM(amount),0) AS totalamount FROM transactions WHERE email IS NOT NULL AND trim(email) != '' AND amount > 0 AND lower(trim(status)) IN (${placeholders})`;
    const approvedRes = await safeQuery(sql, approvedStatuses);
    const approvedSummary = approvedRes.rows[0] || { investorcount: 0, totalamount: 0 };

    const before = {
      metrics: metricsRow,
      approvedSummary: { investorCount: Number(approvedSummary.investorcount || 0), totalAmount: Number(approvedSummary.totalamount || 0) }
    };

    // Backup to file
    const backupDir = path.resolve(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `project_metrics_backup_${ts}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(before, null, 2));
    console.log('Backup written to', backupPath);

    // Begin transaction and apply reconciliation
    await safeQuery('BEGIN');
    try {
      const newAmount = Number(approvedSummary.totalamount || 0);
      await safeQuery('UPDATE project_metrics SET collectedAmount = $1, investedAmount = $1, updatedAt = NOW() WHERE id = $2', [newAmount, 'default_project']);
      await safeQuery('COMMIT');
      console.log('Reconciliation applied: project_metrics updated to', newAmount);
    } catch (err) {
      await safeQuery('ROLLBACK');
      throw err;
    }

    // Fetch after state
    const afterRes = await safeQuery("SELECT id, name, collectedAmount, investedAmount, updatedAt FROM project_metrics WHERE id = $1", ['default_project']);
    const afterRow = afterRes.rows[0] || null;

    const result = { before, after: { metrics: afterRow, approvedSummary: { investorCount: Number(approvedSummary.investorcount || 0), totalAmount: Number(approvedSummary.totalamount || 0) } } };
    const resultPath = path.join(backupDir, `project_metrics_reconcile_result_${ts}.json`);
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    console.log('Result written to', resultPath);
    console.log('Before:', JSON.stringify(before, null, 2));
    console.log('After:', JSON.stringify(afterRow, null, 2));

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('Reconciliation failed:', error?.message || error);
    try { await client.end(); } catch (e) {}
    process.exit(2);
  }
};

main();
