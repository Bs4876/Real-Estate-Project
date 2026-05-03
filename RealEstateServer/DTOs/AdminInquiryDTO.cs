using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record AdminInquiryDTO(
        int InquiryId,
        int? UserId,
        string UserName,
        string Name,
        string Email,
        string Phone,
        string Subject,
        string Message,
        DateTime? CreatedAt,
        string Status
    );
}
