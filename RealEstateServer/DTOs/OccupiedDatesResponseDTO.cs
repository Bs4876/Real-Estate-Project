using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record OccupiedDatesResponseDTO(
    int ProductId,
    int Month,
    int Year,
    List<string> OccupiedDates
);
}
