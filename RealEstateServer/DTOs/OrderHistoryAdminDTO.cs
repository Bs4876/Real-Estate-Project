using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record OrderHistoryAdminDTO(
        int OrderId,
        int UserId,
        string UserName,
        DateTime OrderDate,
        decimal TotalAmount,
        string Status,
        List<OrderItemViewDTO> OrderItems
    );
}
