namespace PropertySearch.Api.Models;

public class Space
{
    public int Id { get; set; }
    public int PropertyId { get; set; }
    public string Type { get; set; } = "";   // bedroom, kitchen, bathroom, living room
    public double Size { get; set; }         // sqft
    public string? Description { get; set; }

    public Property? Property { get; set; }
}
