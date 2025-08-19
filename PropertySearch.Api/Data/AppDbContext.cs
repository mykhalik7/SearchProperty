using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PropertySearch.Api.Models;

namespace PropertySearch.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Property> Properties => Set<Property>();
    public DbSet<Space> Spaces => Set<Space>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure the decimal to double conversion for SQLite
        // This is necessary because SQLite does not support decimal types natively.
        if (Database.IsSqlite())
        {
            var decToDouble = new ValueConverter<decimal, double>(
                v => (double)v,
                v => (decimal)v);

            modelBuilder.Entity<Property>()
                .Property(p => p.Price)
                .HasConversion(decToDouble)
                .HasColumnType("REAL");
        }

        modelBuilder.Entity<Property>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Address).IsRequired();
            e.Property(x => x.Type).IsRequired();
            e.Property(x => x.Price).IsRequired();
            e.HasIndex(x => x.Type);
            e.HasIndex(x => x.Price);
            e.HasMany(x => x.Spaces)
             .WithOne(x => x.Property!)
             .HasForeignKey(x => x.PropertyId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Space>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Type).IsRequired();
            e.Property(x => x.Size).IsRequired();
            e.HasIndex(x => x.Type);
            e.HasIndex(x => x.Size);
            e.HasIndex(x => x.PropertyId);
        });
    }
}
