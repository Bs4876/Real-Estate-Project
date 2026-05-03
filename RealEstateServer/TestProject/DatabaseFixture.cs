using Microsoft.EntityFrameworkCore;
using Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestProject
{
    public class DatabaseFixture : IDisposable
    {
        public ShopContext Context { get; private set; }

        public DatabaseFixture()
        {

            // Use in-memory database for testing
            var options = new DbContextOptionsBuilder<ShopContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            Context = new ShopContext(options);
        }

        public void Dispose()
        {
            Context.Dispose();
        }
    }
}