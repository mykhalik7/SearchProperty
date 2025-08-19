using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PropertySearch.Api.Data;

namespace PropertySearch.Api.Controllers;

[ApiController]
[Route("stats")]
public class StatsController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    public StatsController(AppDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    // GET /stats/spaces
    [HttpGet("spaces")]
    public async Task<IActionResult> SpaceStats()
    {
        var overall = await _dbContext.Spaces.AverageAsync(s => s.Size);
        var perProperty = await _dbContext.Spaces
            .GroupBy(s => s.PropertyId)
            .Select(g => new { property_id = g.Key, avg_size = g.Average(x => x.Size) })
            .Join(_dbContext.Properties, x => x.property_id, p => p.Id, (x, p) => new { x.property_id, p.Address, x.avg_size })
            .OrderByDescending(x => x.avg_size)
            .ToListAsync();

        return Ok(new { overall, perProperty });
    }
}
