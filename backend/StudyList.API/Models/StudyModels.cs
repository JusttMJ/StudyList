using System;
using System.ComponentModel.DataAnnotations;

namespace StudyList.API.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PasswordHash { get; set; }
        public string AuthProvider { get; set; } = "Local";
        public int TotalStudyMinutes { get; set; }

        // Gamification
        public int CoinBalance { get; set; }
        public int CurrentStreak { get; set; }
        public int StreakShieldsCount { get; set; }
        public DateTime? LastStudyDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class StudySession
    {
        [Key]
        public int SessionId { get; set; }
        public int UserId { get; set; }
        public int DurationMinutes { get; set; }
        public string? Subject { get; set; }
        public bool WasCompleted { get; set; }
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    }

    public class StudyClash
    {
        [Key]
        public int ClashId { get; set; }
        public int ChallengerId { get; set; }
        public int TargetUserId { get; set; }
        public int WagerAmount { get; set; }
        public int DurationMinutes { get; set; }
        public string Status { get; set; } = "Pending";
        public int? WinnerId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Deck
    {
        [Key]
        public int DeckId { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? SourceFileUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Flashcard
    {
        [Key]
        public int CardId { get; set; }
        public int DeckId { get; set; }
        public string FrontContent { get; set; } = string.Empty;
        public string BackContent { get; set; } = string.Empty;
        public int ReviewCount { get; set; }
        public DateTime? LastReviewedAt { get; set; }
    }
}