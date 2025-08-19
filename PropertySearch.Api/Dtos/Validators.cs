using FluentValidation;

namespace PropertySearch.Api.Dtos;

public class CreateSpaceDtoValidator : AbstractValidator<CreateSpaceRequest>
{
    public CreateSpaceDtoValidator()
    {
        RuleFor(x => x.Type).NotEmpty();
        RuleFor(x => x.Size).GreaterThan(0);
    }
}

public class CreatePropertyDtoValidator : AbstractValidator<CreatePropertyRequest>
{
    public CreatePropertyDtoValidator()
    {
        RuleFor(x => x.Address).NotEmpty();
        RuleFor(x => x.Type).NotEmpty();
        RuleFor(x => x.Price).GreaterThan(0);
        RuleForEach(x => x.Spaces!).SetValidator(new CreateSpaceDtoValidator()!).When(x => x.Spaces != null);
    }
}
