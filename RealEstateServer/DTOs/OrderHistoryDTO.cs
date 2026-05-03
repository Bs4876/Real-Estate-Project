using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record OrderHistoryDTO(
    int OrderId,
    DateTime OrderDate,
    decimal TotalAmount,
    string Status,
    List<OrderItemViewDTO> OrderItems 
);
}
