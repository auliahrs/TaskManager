namespace TaskManagerAPI.Models
{
    public class TaskItem
    {
        public int Id { get; set; }           // Unique number for each task
        public string Title { get; set; } = string.Empty;  // The task name
        public bool IsCompleted { get; set; } = false;     // Done or not done?
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // When it was created
        public DateTime? DueDate { get; set; } = null; // Nullable field
    }
}