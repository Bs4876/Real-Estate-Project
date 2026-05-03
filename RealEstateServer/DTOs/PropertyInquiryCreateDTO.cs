using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record PropertyInquiryCreateDTO(
        int ProductId,
        int UserId,
        int OwnerId,
        string Name,
        string Phone,
        string Email,
        string Message
    );
}
