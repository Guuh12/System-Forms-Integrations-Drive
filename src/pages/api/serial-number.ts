import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const serialFilePath = path.resolve(process.cwd(), 'serial.txt');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    let current = 0;
    if (fs.existsSync(serialFilePath)) {
      const content = fs.readFileSync(serialFilePath, 'utf-8');
      current = parseInt(content, 10) || 0;
    }
    const next = current + 1;
    fs.writeFileSync(serialFilePath, next.toString(), 'utf-8');
    res.status(200).json({ serial: next });
  } else if (req.method === 'GET') {
    let current = 0;
    if (fs.existsSync(serialFilePath)) {
      const content = fs.readFileSync(serialFilePath, 'utf-8');
      current = parseInt(content, 10) || 0;
    }
    res.status(200).json({ serial: current });
  } else {
    res.status(405).end();
  }
}