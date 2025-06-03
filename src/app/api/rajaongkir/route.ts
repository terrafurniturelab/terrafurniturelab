import { NextResponse } from 'next/server';

const KEMENDAGRI_BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  try {
    let url = '';
    switch (type) {
      case 'province':
        url = `${KEMENDAGRI_BASE_URL}/provinces.json`;
        break;
      case 'city':
        url = `${KEMENDAGRI_BASE_URL}/regencies/${id}.json`;
        break;
      case 'district':
        url = `${KEMENDAGRI_BASE_URL}/districts/${id}.json`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', errorText);
      throw new Error(`Failed to fetch data: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({ rajaongkir: { results: data } });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 