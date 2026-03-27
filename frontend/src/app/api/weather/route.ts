import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat') || '40.7128';
    const lon = searchParams.get('lon') || '-74.0060';
    const unit = searchParams.get('unit') || 'celsius'; // open-meteo uses 'celsius' or 'fahrenheit'

    // We use next { revalidate: 1800 } to cache the fetch request for 30 minutes.
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${parseFloat(lat)}&longitude=${parseFloat(lon)}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=${unit}&timezone=auto`, {
      next: { revalidate: 1800 }
    });
    
    if (!res.ok) throw new Error("Failed to fetch weather from OpenMeteo");
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Weather Route Error:", error);
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
