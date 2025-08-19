# Property Search (ASP.NET Core + EF Core + React)

## Run

### Backend
```bash
cd PropertySearch.Api
dotnet restore
dotnet run    # http://localhost:5005 (Swagger at /swagger)
```

### Frontend
```bash
cd property-search-frontend
npm install
# optionally: echo 'VITE_API_BASE=http://localhost:5005' > .env.local
npm run dev   # http://localhost:5173
```

## Endpoints
- GET /properties?type=&min_price=&max_price=&page=&limit=&sort=price_asc|price_desc
- GET /properties/{id}
- POST /properties  (with optional spaces[])
- GET /spaces?property_id=&type=&min_size=&page=&limit=
- GET /stats/spaces

Seed data is auto-created on first run.
