using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record AdminInquiryCreateDTO(
        int? UserId,
        string Name,
        string Email,
        string Phone,
        string Subject,
        string Message
    );
}
