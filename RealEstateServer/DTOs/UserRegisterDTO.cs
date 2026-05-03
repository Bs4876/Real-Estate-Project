using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace DTOs
{
    public record UserRegisterDTO(
        [Required(ErrorMessage = "שם מלא הוא שדה חובה")]
        string FullName,

        [Required(ErrorMessage = "אימייל הוא שדה חובה")]
        [EmailAddress(ErrorMessage = "פורמט אימייל לא תקין")]
        string Email,

        [Required(ErrorMessage = "סיסמה היא שדה חובה")]
        [MinLength(8, ErrorMessage = "הסיסמה חייבת להכיל לפחות 8 תווים")]
        string Password,

        [Required(ErrorMessage = "מספר טלפון הוא שדה חובה")]
        [Phone(ErrorMessage = "מספר טלפון לא תקין")]
        string Phone,

        string Address
    );

}
