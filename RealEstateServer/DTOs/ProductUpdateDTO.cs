using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record ProductUpdateDTO(
        string? Title,
        string? Description,
        decimal? Price,
        string? ImageUrl,
        List<ProductImageUrlDTO>? AdditionalImages,
        int? CategoryId,
        string? City,
        int? Beds,
        int? Rooms,
        string? TransactionType,
        bool? IsAvailable
    );

}
