using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record OrderItemViewDTO(
        int ProductId,
        decimal PriceAtPurchase,
        ProductViewDTO Product,
        DateTime StartDate,
        DateTime EndDate
        
    );
}
