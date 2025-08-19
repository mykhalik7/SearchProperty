using FluentValidation;
using Microsoft.EntityFrameworkCore;
using PropertySearch.Api.Data;
using PropertySearch.Api.Dtos;
using PropertySearch.Api.Seed;

var builder = WebApplication.CreateBuilder(args);

// predictable port for local dev
builder.WebHost.UseUrls("http://localhost:5005");
System.IO.Directory.CreateDirectory("App_Data");

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddCors(opt =>
{
    opt.AddDefaultPolicy(p => p
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddValidatorsFromAssemblyContaining<CreatePropertyDtoValidator>();


var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();
app.MapControllers();



// Ensure DB + seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();
    await DbSeeder.SeedAsync(db);
}

app.Run();
