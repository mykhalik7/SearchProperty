using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PropertySearch.Api.Data;
using PropertySearch.Api.Dtos;


namespace PropertySearch.Api.Controllers;

[ApiController]
[Route("spaces")]
public class SpacesController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    public SpacesController(AppDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    // GET /spaces?property_id=&type=&min_size=&page=1&limit=10
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery(Name="property_id")] int? propertyId,
        [FromQuery] string? type, [FromQuery(Name="min_size")] double? minSize,
        [FromQuery] int page = 1, [FromQuery] int limit = 10)
    {
        page = Math.Max(1, page);
        limit = Math.Clamp(limit, 1, 100);

        var q = _dbContext.Spaces.AsNoTracking().AsQueryable();
        if (propertyId.HasValue) q = q.Where(s => s.PropertyId == propertyId.Value);
        if (!string.IsNullOrWhiteSpace(type)) q = q.Where(s => s.Type == type);
        if (minSize.HasValue) q = q.Where(s => s.Size >= minSize.Value);

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(s => s.Size)
            .Skip((page - 1) * limit).Take(limit)
            .Select(s => new SpaceDto(s.Id, s.PropertyId, s.Type, s.Size, s.Description))
            .ToListAsync();

        return Ok(new { total, items });
    }
}
