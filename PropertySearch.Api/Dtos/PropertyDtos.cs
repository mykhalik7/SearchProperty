namespace PropertySearch.Api.Dtos;

public record SpaceDto(int Id, int PropertyId, string Type, double Size, string? Description);
public record PropertyDto(int Id, string Address, string Type, decimal Price, string? Description, List<SpaceDto> Spaces);
public record CreateSpaceRequest(string Type, double Size, string? Description);
public record CreatePropertyRequest(string Address, string Type, decimal Price, string? Description, List<CreateSpaceRequest>? Spaces);
