using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record UserProfileDTO(
        int UserId,
        string FullName,
        string Phone,
        string Address,
        bool IsAdmin
    );

}
