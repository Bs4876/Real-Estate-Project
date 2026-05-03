using System;

namespace DTOs
{
    public record OrderAdminDTO(
        int OrderId,
        int UserId,
        string UserName,
        DateTime? OrderDate,
        decimal TotalAmount,
        string Status
    );
}
