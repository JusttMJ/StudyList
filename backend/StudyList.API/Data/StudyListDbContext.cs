using StudyList.API.Models;
using Microsoft.EntityFrameworkCore;

public class StudyListDbContext : DbContext
{
    public StudyListDbContext(DbContextOptions<StudyListDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<StudySession> StudySessions { get; set; }
    public DbSet<StudyClash> StudyClashes { get; set; }
    public DbSet<Deck> Decks { get; set; }
    public DbSet<Flashcard> Flashcards { get; set; }
}