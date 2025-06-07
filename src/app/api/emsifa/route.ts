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
        if (!id) {
          return NextResponse.json({ error: 'Province ID is required' }, { status: 400 });
        }
        url = `${KEMENDAGRI_BASE_URL}/regencies/${id}.json`;
        break;
      case 'district':
        if (!id) {
          return NextResponse.json({ error: 'City ID is required' }, { status: 400 });
        }
        url = `${KEMENDAGRI_BASE_URL}/districts/${id}.json`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match the expected format
    const transformedData = data.map((item: any) => ({
      id: item.id,
      name: item.name
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
} 