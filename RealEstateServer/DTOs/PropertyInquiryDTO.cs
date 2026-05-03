using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record PropertyInquiryDTO(
        int InquiryId,
        int ProductId,
        string ProductTitle,
        int UserId,
        string UserName,
        int OwnerId,
        string OwnerName,
        string Name,
        string Phone,
        string Email,
        string Message,
        DateTime? CreatedAt,
        string Status
    );
}
