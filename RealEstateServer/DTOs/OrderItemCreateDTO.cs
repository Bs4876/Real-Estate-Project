using System;

namespace DTOs
{
    public record OrderItemCreateDTO(
        int ProductId,
        DateTime? StartDate,
        DateTime? EndDate
    );
}
