namespace StudyList.API.DTOs
{
    public class CreateClashDto
    {
        public int ChallengerId { get; set; }

        public string TargetUsername { get; set; }

        public int WagerAmount { get; set; }
        public int DurationMinutes { get; set; }
    }

    public class UpdateSessionDto
    {
        public int UserId { get; set; }
        public int DurationMinutes { get; set; }
        public bool WasCompleted { get; set; }
        public string Subject { get; set; }

        // THE FIX: Add this line so we know WHICH battle just finished!
        public int? ClashId { get; set; }
    }

    public class LoginDto
    {
        public string Username { get; set; }
    }
}