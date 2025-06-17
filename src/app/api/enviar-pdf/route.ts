import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pdfBase64, fileName, folderName } = body;

    const response = await fetch('https://script.google.com/macros/s/AKfycbySGLcT528CY4seJnJavosm2u3y9Ui5s5m-xpp2htPWBQ9gyQ3Aons1zyyNK8imyTnIwg/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfBase64, fileName, folderName }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao enviar para o Apps Script', details: error.message }, { status: 500 });
  }
} 