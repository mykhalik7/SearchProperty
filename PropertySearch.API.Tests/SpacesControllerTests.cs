using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PropertySearch.Api.Controllers;
using PropertySearch.Api.Data;
using PropertySearch.Api.Dtos;
using PropertySearch.Api.Models;
using System.Text.Json;
using Xunit;

namespace PropertySearch.API.Tests
{
    public class SpacesControllerTests
    {
        private SpacesController GetControllerWithDb(params Space[] spaces)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                // unique DB per test to avoid leakage/collisions
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var dbContext = new AppDbContext(options);
            dbContext.Database.EnsureCreated();

            if (spaces?.Length > 0)
            {
                dbContext.Spaces.AddRange(spaces);
                dbContext.SaveChanges();
                dbContext.ChangeTracker.Clear();
            }

            return new SpacesController(dbContext);
        }

        private static (int Total, List<SpaceDto> Items) UnwrapOk(OkObjectResult ok)
        {
            Assert.NotNull(ok.Value);
            var value = ok.Value!;
            var type = value.GetType();

            // Controller returns: Ok(new { total, items = dtos })
            var totalProp = type.GetProperty("total");
            var itemsProp = type.GetProperty("items");
            Assert.NotNull(totalProp);
            Assert.NotNull(itemsProp);

            var total = (int)totalProp!.GetValue(value)!;

            // Try to cast directly to IEnumerable<SpaceDto>
            var itemsObj = itemsProp!.GetValue(value)!;
            if (itemsObj is IEnumerable<SpaceDto> typed)
                return (total, typed.ToList());

            // Fallback: go through JSON (handles anonymous type serialization edge cases)
            var json = JsonSerializer.Serialize(value);
            using var doc = JsonDocument.Parse(json);
            var items = doc.RootElement.GetProperty("items")
                .EnumerateArray()
                .Select(e => new SpaceDto(
                    e.GetProperty("id").GetInt32(),
                    e.GetProperty("propertyId").GetInt32(),
                    e.GetProperty("type").GetString()!,
                    e.GetProperty("size").GetInt32(),
                    e.TryGetProperty("description", out var d) && d.ValueKind != JsonValueKind.Null ? d.GetString() : null
                ))
                .ToList();

            return (total, items);
        }

        [Fact]
        public async Task Get_ReturnsEmpty_WhenNoSpaces()
        {
            var controller = GetControllerWithDb();

            var result = await controller.Get(propertyId: null, type: null, minSize: null, page: 1, limit: 10);
            var ok = Assert.IsType<OkObjectResult>(result);

            var (total, items) = UnwrapOk(ok);
            Assert.Equal(0, total);
            Assert.Empty(items);
            Assert.DoesNotContain(items, s => s.Id == 999);
        }

        [Fact]
        public async Task Get_ReturnsOkResult_WhenSpaceExists()
        {
            var space = new Space { Id = 1, PropertyId = 1, Type = "bedroom", Size = 20 };
            var controller = GetControllerWithDb(space);

            var result = await controller.Get(propertyId: 1, type: "bedroom", minSize: 20, page: 1, limit: 10);
            var ok = Assert.IsType<OkObjectResult>(result);

            var (total, items) = UnwrapOk(ok);
            Assert.Equal(1, total);
            Assert.Contains(items, s => s.Id == 1);
        }
    }
}
