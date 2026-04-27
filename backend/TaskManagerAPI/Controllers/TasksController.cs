using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagerAPI.Data;
using TaskManagerAPI.Models;

namespace TaskManagerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]  // This means the URL will be: /api/tasks
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        // The database context is "injected" here automatically
        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        // ─────────────────────────────────────────
        // GET /api/tasks  → Get ALL tasks
        // ─────────────────────────────────────────
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
        {
            return await _context.Tasks.ToListAsync();
        }

        // ─────────────────────────────────────────
        // GET /api/tasks/5  → Get ONE task by its ID
        // ─────────────────────────────────────────
        [HttpGet("{id}")]
        public async Task<ActionResult<TaskItem>> GetTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
                return NotFound(); // Returns 404 if task doesn't exist

            return task;
        }

        // ─────────────────────────────────────────
        // POST /api/tasks  → Create a NEW task
        // ─────────────────────────────────────────
        [HttpPost]
        public async Task<ActionResult<TaskItem>> CreateTask(TaskItem task)
        {
            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            // Returns 201 Created + the new task data
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }

        // ─────────────────────────────────────────
        // PUT /api/tasks/5  → UPDATE an existing task
        // ─────────────────────────────────────────
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, TaskItem task)
        {
            if (id != task.Id)
                return BadRequest(); // Returns 400 if IDs don't match

            _context.Entry(task).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Tasks.Any(e => e.Id == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent(); // Returns 204 - success but nothing to return
        }

        // ─────────────────────────────────────────
        // DELETE /api/tasks/5  → DELETE a task
        // ─────────────────────────────────────────
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
                return NotFound();

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent(); // Returns 204 - successfully deleted
        }
    }
}