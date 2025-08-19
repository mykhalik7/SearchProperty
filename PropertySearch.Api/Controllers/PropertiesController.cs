using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PropertySearch.Api.Data;
using PropertySearch.Api.Dtos;
using PropertySearch.Api.Models;

namespace PropertySearch.Api.Controllers;

[ApiController]
[Route("properties")]
public class PropertiesController : ControllerBase
{
    private static readonly HashSet<string> AllowedPropTypes = new(["house","apartment","condo"]);
    private static readonly HashSet<string> AllowedSpaceTypes = new(["bedroom","kitchen","bathroom","living room"]);

    private readonly AppDbContext _dbContext;
    public PropertiesController(AppDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    // GET /properties?type=&min_price=&max_price=&page=&limit=&sort=price_asc|price_desc
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? type, [FromQuery(Name="min_price")] decimal? minPrice,
        [FromQuery(Name="max_price")] decimal? maxPrice, [FromQuery] int page = 1, [FromQuery] int limit = 10,
        [FromQuery] string? sort = null)
    {
        page = Math.Max(1, page);
        limit = Math.Clamp(limit, 1, 100);

        var q = _dbContext.Properties.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(type)) q = q.Where(p => p.Type == type);
        if (minPrice.HasValue) q = q.Where(p => p.Price >= minPrice.Value);
        if (maxPrice.HasValue) q = q.Where(p => p.Price <= maxPrice.Value);

        q = sort switch
        {
            "price_asc" => q.OrderBy(p => p.Price),
            "price_desc" => q.OrderByDescending(p => p.Price),
            _ => q.OrderBy(p => p.Id)
        };

        var total = await q.CountAsync();

        var items = await q
            .Skip((page - 1) * limit)
            .Take(limit)
            .Include(p => p.Spaces) // avoid N+1
            .ToListAsync();

        var dtos = items.Select(p => new PropertyDto(
            p.Id, p.Address, p.Type, p.Price, p.Description,
            p.Spaces.Select(s => new SpaceDto(s.Id, s.PropertyId, s.Type, s.Size, s.Description)).ToList()
        ));

        return Ok(new { total, items = dtos });
    }

    // GET /properties/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int id)
    {
        var p = await _dbContext.Properties.AsNoTracking().Include(p => p.Spaces).FirstOrDefaultAsync(p => p.Id == id);
        if (p is null) return NotFound();

        var dto = new PropertyDto(
            p.Id, p.Address, p.Type, p.Price, p.Description,
            p.Spaces.Select(s => new SpaceDto(s.Id, s.PropertyId, s.Type, s.Size, s.Description)).ToList()
        );
        return Ok(dto);
    }

    // POST /properties
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePropertyRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Address))
            return BadRequest(new { error = "address is required" });
        if (string.IsNullOrWhiteSpace(req.Type) || !AllowedPropTypes.Contains(req.Type))
            return BadRequest(new { error = $"type must be one of: {string.Join(", ", AllowedPropTypes)}" });
        if (req.Price <= 0)
            return BadRequest(new { error = "price must be positive" });

        var entity = new Property
        {
            Address = req.Address.Trim(),
            Type = req.Type,
            Price = req.Price,
            Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description!.Trim()
        };

        if (req.Spaces is { Count: > 0 })
        {
            foreach (var s in req.Spaces)
            {
                if (!AllowedSpaceTypes.Contains(s.Type))
                    return BadRequest(new { error = $"space.type must be one of: {string.Join(", ", AllowedSpaceTypes)}" });
                if (s.Size <= 0) return BadRequest(new { error = "space.size must be positive" });

                entity.Spaces.Add(new Space
                {
                    Type = s.Type,
                    Size = s.Size,
                    Description = string.IsNullOrWhiteSpace(s.Description) ? null : s.Description!.Trim()
                });
            }
        }

        _dbContext.Properties.Add(entity);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, new { id = entity.Id });
    }
}
