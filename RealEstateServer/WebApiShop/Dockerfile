# Multi-stage Dockerfile for WebApiShop (ASP.NET Core 8)

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy everything and restore/publish the specific project. When building from repo root:
# docker build -f RealEstateServer/WebApiShop/Dockerfile .
COPY . .

# Restore and publish the WebApiShop project
RUN dotnet restore "RealEstateServer/WebApiShop/WebApiShop.csproj"
RUN dotnet publish "RealEstateServer/WebApiShop/WebApiShop.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Bind to port 80 inside the container
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

# Copy published output from build stage
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "WebApiShop.dll"]
