import Badge from '@/models/Badge';
import GameSession from '@/models/GameSession';
import QuizAttempt from '@/models/QuizAttempt';
import User from '@/models/User';

const ALL_GAME_SLUGS = ['forest-guardian', 'ocean-explorer', 'eco-city-builder', 'recycle-rally', 'carbon-quest'];

export interface AwardedBadge {
    id: string;
    name: string;
    description: string;
    icon_key: string;
}

export async function evaluateAndAwardBadges(userId: string): Promise<AwardedBadge[]> {
    const user = await User.findById(userId);
    if (!user) return [];

    const [allBadges, playedGames, hasPerfectScore] = await Promise.all([
        Badge.find({}).lean(),
        GameSession.distinct('game_slug', { user_id: userId }),
        QuizAttempt.exists({ user_id: userId, $expr: { $eq: ['$score', '$max_score'] } }),
    ]);

    if (!allBadges || allBadges.length === 0) return [];

    const ownedBadgeIds = new Set(user.badges.map((badge) => badge.badge_id.toString()));
    const badgeByName = new Map(allBadges.map((badge: any) => [badge.name, badge]));
    const uniqueGames = new Set(playedGames);
    const newlyAwarded: AwardedBadge[] = [];

    const awardBadgeIfEligible = (badgeName: string, isEligible: boolean) => {
        const badge = badgeByName.get(badgeName);
        if (!badge || !isEligible) return;

        const badgeId = badge._id.toString();
        if (ownedBadgeIds.has(badgeId)) return;

        user.badges.push({ badge_id: badge._id, earned_at: new Date() });
        ownedBadgeIds.add(badgeId);
        newlyAwarded.push({
            id: badgeId,
            name: badge.name,
            description: badge.description,
            icon_key: badge.icon_key,
        });
    };

    awardBadgeIfEligible('First Steps', user.points > 0 || user.streak > 0 || uniqueGames.size > 0);
    awardBadgeIfEligible('Eco Warrior', user.points >= 1000);
    awardBadgeIfEligible('Streak Starter', user.streak >= 3);
    awardBadgeIfEligible('Perfect Score', Boolean(hasPerfectScore));
    awardBadgeIfEligible('Game Master', ALL_GAME_SLUGS.every((slug) => uniqueGames.has(slug)));

    if (newlyAwarded.length > 0) {
        await user.save();
    }

    return newlyAwarded;
}
