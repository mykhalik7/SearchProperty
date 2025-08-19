using Xunit;
using Microsoft.AspNetCore.Mvc;
using PropertySearch.Api.Controllers;
using PropertySearch.Api.Data;
using PropertySearch.Api.Models; // Add missing using for Property and Space
using Microsoft.EntityFrameworkCore;

namespace PropertySearch.API.Tests
{
    public class StatsControllerTests
    {
        // Fix: Use consistent in-memory context creation
        private AppDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "StatsTestDb")
                .Options;
            return new AppDbContext(options);
        }

        [Fact]
        public async Task SpaceStats_ReturnsOkResult()
        {
            var db = GetInMemoryDbContext();

            // Seed test data
            var property = new Property { Id = 1, Address = "123 Main St", Type = "house", Price = 100000 };
            db.Properties.Add(property);
            db.Spaces.Add(new Space { Id = 1, PropertyId = 1, Type = "bedroom", Size = 200 });
            db.Spaces.Add(new Space { Id = 2, PropertyId = 1, Type = "kitchen", Size = 100 });
            db.SaveChanges();

            var controller = new StatsController(db);
            var result = await controller.SpaceStats();
            Assert.IsType<OkObjectResult>(result);
        }
    }
}