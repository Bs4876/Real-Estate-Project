using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record ProductSummaryDTO(
     int ProductId,
     string Title,
     decimal Price,
     string ImageUrl,
     string City,
     int? Beds,
     int? Rooms,
     int? CategoryId,
     int? OwnerId,
     string CategoryCategoryName,
     string TransactionType,
     bool IsAvailable

    );
}
