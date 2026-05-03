using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public record ProductDetailsDTO(
        int ProductId,
        string Title,
        string Description,
        decimal Price,
        string ImageUrl,
        List<ProductImageUrlDTO> ProductImages,
        string City,
        int? Beds,
        int? Rooms,
        int? CategoryId,
        int? OwnerId,
        string TransactionType,
        bool? IsAvailable
    );
}
//namespace DTOs
//{
//    public class ProductDetailsDTO
//    {
//        public ProductDetailsDTO() { }

//        public int ProductId { get; set; }
//        public string Title { get; set; }
//        public string Description { get; set; }
//        public decimal Price { get; set; }
//        public string ImageUrl { get; set; }
//        public List<ProductImageUrlDTO> AdditionalImageUrl { get; set; }
//        public string City { get; set; }
//        public int Beds { get; set; }
//        public int Rooms { get; set; }
//        public string CategoryId { get; set; }
//        public int UserId { get; set; }
//    }
//}