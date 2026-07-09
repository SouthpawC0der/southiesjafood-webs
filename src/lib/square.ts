import { SquareClient, SquareEnvironment } from "square";

let _client: SquareClient | null = null;

export function getSquare(): SquareClient {
  if (!_client) {
    const token = process.env.SQUARE_ACCESS_TOKEN;
    if (!token) throw new Error("SQUARE_ACCESS_TOKEN is not configured.");
    _client = new SquareClient({
      token,
      environment: SquareEnvironment.Production,
    });
  }
  return _client;
}

export function getLocationId(): string {
  const id = process.env.SQUARE_LOCATION_ID;
  if (!id) throw new Error("SQUARE_LOCATION_ID is not configured.");
  return id;
}
