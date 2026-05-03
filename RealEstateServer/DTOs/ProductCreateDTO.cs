using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record ProductCreateDTO(
        int OwnerId,
        string Title,
        string Description,
        decimal Price,
        string ImageUrl,
        List<ProductImageUrlDTO> ProductImages,
        int CategoryId,
        string City,
        int Beds,
        int Rooms,
        string TransactionType

    );
}
