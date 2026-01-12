interface ScoreData {
	date: string;
	bestScore: number;
}

const STORAGE_KEY = "firewall_defender_scores";

function getTodayString(): string {
	const today = new Date();
	return today.toISOString().split("T")[0];
}

export function getTodaysBestScore(): number {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return 0;

		const data: ScoreData = JSON.parse(stored);
		const today = getTodayString();

		if (data.date === today) {
			return data.bestScore;
		}

		return 0;
	} catch {
		return 0;
	}
}

export function updateBestScore(score: number): boolean {
	try {
		const today = getTodayString();
		const currentBest = getTodaysBestScore();

		if (score > currentBest) {
			const data: ScoreData = {
				date: today,
				bestScore: score,
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
			return true;
		}

		return false;
	} catch {
		return false;
	}
}
