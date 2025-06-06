import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const country = url.searchParams.get("country") || "USA";

  // Example states for USA only
  const states = country === "USA"
    ? ["California", "Texas", "New York", "Florida", "Illinois"]
    : [];

  return NextResponse.json(states);
}
