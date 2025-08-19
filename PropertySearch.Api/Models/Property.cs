namespace PropertySearch.Api.Models;

public class Property
{
    public int Id { get; set; }
    public string Address { get; set; } = "";
    public string Type { get; set; } = "";   // house, apartment, condo
    public decimal Price { get; set; }       // USD
    public string? Description { get; set; }

    public List<Space> Spaces { get; set; } = new();
}
