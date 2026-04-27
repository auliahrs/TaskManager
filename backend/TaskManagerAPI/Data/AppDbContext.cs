using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Models;

namespace TaskManagerAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // This tells EF Core: "There's a table called Tasks in the database"
        public DbSet<TaskItem> Tasks { get; set; }
    }
}