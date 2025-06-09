import { NextResponse } from 'next/server';

const KEMENDAGRI_BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

interface RegionData {
  id: string;
  name: string;
}

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

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error('Invalid API response format:', data);
      throw new Error('Invalid API response format');
    }
    
    // Transform the data to match the expected format
    const transformedData = data.map((item: RegionData) => ({
      id: item.id,
      name: item.name
    }));

    return NextResponse.json(transformedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch data', 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: type,
        id: id
      }, 
      { status: 500 }
    );
  }
} 