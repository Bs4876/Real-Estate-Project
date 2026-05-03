using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record UserUpdateDTO
     (
        string? FullName,
        [EmailAddress(ErrorMessage = "פורמט אימייל לא תקין")]
        string? Email,
        [MinLength(8, ErrorMessage = "הסיסמה חייבת להכיל לפחות 8 תווים")]
        string? Password,
        string? OldPassword,
        [Phone(ErrorMessage = "מספר טלפון לא תקין")]
        string? Phone,
        string? Address
    );

}
