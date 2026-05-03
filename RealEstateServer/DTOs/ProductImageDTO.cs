using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record ProductImageDTO(
        int ImageId,
        int ProductId,
        string AdditionalImageUrl
    );
}