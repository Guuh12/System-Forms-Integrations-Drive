import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetch('https://script.google.com/macros/s/AKfycbxpCv2dQgzIVnOidTbdmeGsfodcfelNjIXQ_2K_AirObP6gwTa0B9yG95oQTxdaFqNT/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao fazer proxy para o Apps Script', details: error.message }, { status: 500 });
  }
} 