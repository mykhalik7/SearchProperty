using Microsoft.EntityFrameworkCore;
using PropertySearch.Api.Data;
using PropertySearch.Api.Models;

namespace PropertySearch.Api.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Properties.AnyAsync()) return;

        var rnd = new Random(1);
        var props = new List<Property>
        {
            new() { Address = "123 Main St, Springfield", Type = "house",     Price = 350000, Description = "Cozy family home with yard" },
            new() { Address = "45 Oak Ave, Metropolis",   Type = "apartment", Price = 220000, Description = "Downtown apartment near transit" },
            new() { Address = "789 Pine Rd, Smallville",  Type = "condo",     Price = 275000, Description = "Modern condo with amenities" },
            new() { Address = "12 River Ln, Riverton",    Type = "house",     Price = 495000, Description = "Spacious house by the river" },
            new() { Address = "9 Sunset Blvd, Coast City",Type = "apartment", Price = 310000, Description = "Sea-view apartment" },
            new() { Address = "16 Maple St, Star City",   Type = "house",     Price = 420000, Description = "Renovated house in quiet area" },
            new() { Address = "33 Birch Ct, Central City",Type = "condo",     Price = 290000, Description = "Condo with gym access" },
            new() { Address = "88 Cedar Way, Gotham",     Type = "apartment", Price = 260000, Description = "Loft-style apartment" }
        };

        string[] stypes = ["bedroom","kitchen","bathroom","living room"];

        foreach (var p in props)
        {
            var count = rnd.Next(3, 5); // 3-4 spaces
            for (int i = 0; i < count; i++)
            {
                var t = stypes[rnd.Next(stypes.Length)];
                var size = Math.Round(80 + rnd.NextDouble() * 140, 1); // 80..220 sqft
                p.Spaces.Add(new Space
                {
                    Type = t,
                    Size = size,
                    Description = t switch {
                        "bedroom" => "Comfortable bedroom",
                        "kitchen" => "Modern kitchen",
                        "bathroom" => "Clean bathroom",
                        _ => "Bright living area"
                    }
                });
            }
        }

        db.Properties.AddRange(props);
        await db.SaveChangesAsync();
    }
}
