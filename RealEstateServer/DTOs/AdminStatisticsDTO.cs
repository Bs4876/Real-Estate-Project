namespace DTOs
{
    public record AdminStatisticsDTO(
        int TotalUsers,
        int TotalProducts,
        int TotalOrders
    );
}
