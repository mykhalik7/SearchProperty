using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PropertySearch.Api.Controllers;
using PropertySearch.Api.Data;
using PropertySearch.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using PropertySearch.Api.Dtos;

namespace PropertySearch.API.Tests
{
    public class PropertiesControllerTests
    {
        private PropertiesController GetControllerWithDb(params Property[] properties)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb")
                .Options;
            var dbContext = new AppDbContext(options);
            dbContext.Properties.AddRange(properties);
            dbContext.SaveChanges();
            return new PropertiesController(dbContext);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenPropertyDoesNotExist()
        {
            var controller = GetControllerWithDb();
            var result = await controller.GetById(999);
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetById_ReturnsOkResult_WhenPropertyExists()
        {
            var property = new Property { Id = 2, Address = "456 Elm St", Type = "apartment", Price = 200000 };
            var controller = GetControllerWithDb(property);

            var result = await controller.GetById(2);
            var okResult = Assert.IsType<OkObjectResult>(result);
            var dto = Assert.IsType<PropertyDto>(okResult.Value);
            Assert.Equal(2, dto.Id);
        }

        [Fact]
        public async Task Create_ReturnsBadRequest_WhenAddressMissing()
        {
            var controller = GetControllerWithDb();
            var req = new CreatePropertyRequest(
                Address: null,
                Type: "house",
                Price: 100000,
                Description: null,
                Spaces: null
            );
            var result = await controller.Create(req);
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("address is required", badRequest.Value.ToString());
        }

        [Fact]
        public async Task Create_ReturnsCreated_WhenValid()
        {
            var controller = GetControllerWithDb();
            var req = new CreatePropertyRequest(
                Address: "789 Oak St",
                Type: "condo",
                Price: 300000,
                Description: null,
                Spaces: new List<CreateSpaceRequest>
                {
                    new CreateSpaceRequest(Type: "bedroom", Size: 20, Description: null)
                }
            );
            var result = await controller.Create(req);
            var created = Assert.IsType<CreatedAtActionResult>(result);
            Assert.NotNull(created.Value);
        }
    }
}