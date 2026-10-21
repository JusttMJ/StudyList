using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyList.API.Models;
using StudyList.API.DTOs;

[ApiController]
[Route("api/[controller]")]
public class StudyListController : ControllerBase
{
    private readonly StudyListDbContext _context;

    public StudyListController(StudyListDbContext context)
    {
        _context = context;
    }

    // 1. WAGER & INITIATE A STUDY CLASH
    [HttpPost("clash/create")]
    public async Task<IActionResult> CreateClash([FromBody] CreateClashDto dto)
    {
        var challenger = await _context.Users.FindAsync(dto.ChallengerId);
        if (challenger == null) return NotFound("Challenger not found.");

        if (challenger.CoinBalance < dto.WagerAmount)
        {
            return BadRequest("Insufficient Focus Coins to place this wager.");
        }

        // --- THE FIX: Look up the target user by their Username ---
        var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.TargetUsername);

        if (targetUser == null)
        {
            return NotFound($"Opponent '{dto.TargetUsername}' does not exist in the database.");
        }

        // Deduct the wager immediately from the challenger
        challenger.CoinBalance -= dto.WagerAmount;

        var newClash = new StudyClash
        {
            ChallengerId = dto.ChallengerId,
            TargetUserId = targetUser.UserId, // Use the ID we just found in the database!
            WagerAmount = dto.WagerAmount,
            DurationMinutes = dto.DurationMinutes,
            Status = "Pending"
        };

        _context.StudyClashes.Add(newClash);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Clash initiated successfully!", ClashId = newClash.ClashId });
    }

    // 2. ACCEPT A CLASH & LOCK THE TARGET USER'S WAGER
    [HttpPost("clash/{id}/accept")]
    public async Task<IActionResult> AcceptClash(int id)
    {
        var clash = await _context.StudyClashes.FindAsync(id);
        if (clash == null) return NotFound("Clash challenge not found.");
        if (clash.Status != "Pending") return BadRequest("This challenge is no longer pending.");

        var targetUser = await _context.Users.FindAsync(clash.TargetUserId);
        if (targetUser == null) return NotFound("Target user not found.");

        if (targetUser.CoinBalance < clash.WagerAmount)
        {
            return BadRequest("Target user does not have enough coins to match the wager.");
        }

        // Deduct the matching wager amount
        targetUser.CoinBalance -= clash.WagerAmount;
        clash.Status = "Active";

        await _context.SaveChangesAsync();
        return Ok(new { Message = "Clash is now active! Start your timers.", Status = clash.Status });
    }

    // 3. LOG A POMODORO SESSION, CALC STREAKS, & AWARD BATTLE WINNERS
    [HttpPost("session/complete")]
    public async Task<IActionResult> CompleteSession([FromBody] UpdateSessionDto dto)
    {
        var user = await _context.Users.FindAsync(dto.UserId);
        if (user == null) return NotFound("User not found.");

        var session = new StudySession
        {
            UserId = dto.UserId,
            DurationMinutes = dto.DurationMinutes,
            WasCompleted = dto.WasCompleted,
            Subject = dto.Subject,
            CompletedAt = DateTime.UtcNow
        };
        _context.StudySessions.Add(session);

        if (dto.WasCompleted)
        {
            user.TotalStudyMinutes += dto.DurationMinutes;
            user.CoinBalance += dto.DurationMinutes; // Base reward (1 coin per min)

            // --- THE BATTLE FIX & PAYOUT ---
            if (dto.ClashId.HasValue)
            {
                var clash = await _context.StudyClashes.FindAsync(dto.ClashId.Value);
                if (clash != null && clash.Status == "Active")
                {
                    clash.Status = "Completed"; // This removes it from the Live Radar!

                    // WINNER TAKES ALL: Your wager + Opponent's wager!
                    int totalPot = clash.WagerAmount * 2;
                    user.CoinBalance += totalPot;
                }
            }

            // (Keep your existing Streak Logic here)
            var today = DateTime.UtcNow.Date;
            if (user.LastStudyDate.HasValue)
            {
                var daysSinceLastStudy = (today - user.LastStudyDate.Value.Date).Days;
                if (daysSinceLastStudy == 1) user.CurrentStreak += 1;
                else if (daysSinceLastStudy > 1)
                {
                    if (user.StreakShieldsCount > 0) user.StreakShieldsCount -= 1;
                    else user.CurrentStreak = 1;
                }
            }
            else user.CurrentStreak = 1;

            user.LastStudyDate = today;
        }

        await _context.SaveChangesAsync();
        return Ok(new { Message = "Session updated.", NewBalance = user.CoinBalance, CurrentStreak = user.CurrentStreak });
    }

    // 4. GET PENDING CHALLENGES (THE INBOX)
    [HttpGet("clash/pending/{targetUserId}")]
    public async Task<IActionResult> GetPendingClashes(int targetUserId)
    {
        var pendingClashes = await _context.StudyClashes
            .Where(c => c.TargetUserId == targetUserId && c.Status == "Pending")
            .Select(c => new
            {
                c.ClashId,
                c.ChallengerId,
                // THE FIX: Ask the Users table for the actual string name!
                ChallengerUsername = _context.Users.Where(u => u.UserId == c.ChallengerId).Select(u => u.Username).FirstOrDefault(),
                c.WagerAmount,
                c.DurationMinutes
            })
            .ToListAsync();

        return Ok(pendingClashes);
    }

    // 5. GET ACTIVE BATTLES (THE RADAR)
    [HttpGet("clash/active/{userId}")]
    public async Task<IActionResult> GetActiveClashes(int userId)
    {
        var activeClashes = await _context.StudyClashes
            .Where(c => (c.ChallengerId == userId || c.TargetUserId == userId) && c.Status == "Active")
            .Select(c => new
            {
                c.ClashId,
                c.WagerAmount,
                c.DurationMinutes,
                // Smart Logic: If I am the Challenger, get the Target's name. If I am the Target, get the Challenger's name!
                OpponentName = _context.Users
                    .Where(u => u.UserId == (c.ChallengerId == userId ? c.TargetUserId : c.ChallengerId))
                    .Select(u => u.Username)
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(activeClashes);
    }

    // 6. GET USER STATS (THE PROFILE)
    [HttpGet("user/{userId}/stats")]
    public async Task<IActionResult> GetUserStats(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound("User not found.");

        // Return a clean package of all their hard-earned stats
        return Ok(new
        {
            user.Username,
            user.CoinBalance,
            user.CurrentStreak,
            user.TotalStudyMinutes,
            user.StreakShieldsCount
        });
    }

    // 7. LOGIN ENDPOINT
    [HttpPost("user/login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);

        if (user == null) return NotFound("Username not found in the database.");

        // Return a secure package with their dynamic ID!
        return Ok(new { UserId = user.UserId, Username = user.Username });
    }
}