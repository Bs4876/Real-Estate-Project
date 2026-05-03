using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

    using System.ComponentModel.DataAnnotations;

    namespace DTOs
    {
        public record UserLoginDTO(
        [Required(ErrorMessage = "נא להזין אימייל")]
        [EmailAddress]
        string Email,

        [Required(ErrorMessage = "נא להזין סיסמה")]
        string Password
        );
    }

