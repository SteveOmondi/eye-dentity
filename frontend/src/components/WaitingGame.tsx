import React, { useState, useEffect } from 'react';

// Icons using simple SVG paths for tech/web theme
const ICONS = {
    code: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
    ),
    server: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
    ),
    cloud: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
    ),
    desktop: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    lock: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    ),
    search: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    zap: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    shield: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
};

type IconType = keyof typeof ICONS;

interface Card {
    id: number;
    icon: IconType;
    isFlipped: boolean;
    isMatched: boolean;
}

export const WaitingGame = () => {
    const [cards, setCards] = useState<Card[]>([]);
    const [moves, setMoves] = useState(0);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [isWon, setIsWon] = useState(false);

    // Initialize game
    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = () => {
        const iconKeys = Object.keys(ICONS) as IconType[];
        // Duplicate keys to create pairs
        const gameIcons = [...iconKeys, ...iconKeys];

        // Shuffle
        const shuffled = gameIcons
            .sort(() => Math.random() - 0.5)
            .map((icon, index) => ({
                id: index,
                icon,
                isFlipped: false,
                isMatched: false,
            }));

        setCards(shuffled);
        setMoves(0);
        setFlippedCards([]);
        setIsWon(false);
    };

    const handleCardClick = (id: number) => {
        // Prevent clicking if already matched, flipped, or if 2 cards already flipped
        if (
            flippedCards.length === 2 ||
            cards[id].isMatched ||
            cards[id].isFlipped
        ) {
            return;
        }

        // Flip card
        const newCards = [...cards];
        newCards[id].isFlipped = true;
        setCards(newCards);

        const newFlipped = [...flippedCards, id];
        setFlippedCards(newFlipped);

        // Check for match if 2 cards flipped
        if (newFlipped.length === 2) {
            setMoves((prev) => prev + 1);
            checkForMatch(newFlipped[0], newFlipped[1]);
        }
    };

    const checkForMatch = (id1: number, id2: number) => {
        const card1 = cards[id1];
        const card2 = cards[id2];

        if (card1.icon === card2.icon) {
            // Match!
            setTimeout(() => {
                setCards((prev) =>
                    prev.map((card) =>
                        card.id === id1 || card.id === id2
                            ? { ...card, isMatched: true, isFlipped: true }
                            : card
                    )
                );
                setFlippedCards([]);
                checkForWin();
            }, 500);
        } else {
            // No Match
            setTimeout(() => {
                setCards((prev) =>
                    prev.map((card) =>
                        card.id === id1 || card.id === id2
                            ? { ...card, isFlipped: false }
                            : card
                    )
                );
                setFlippedCards([]);
            }, 1000);
        }
    };

    const checkForWin = () => {
        // We use setTimeout to allow the state update to process
        setTimeout(() => {
            setCards((currentCards) => {
                const allMatched = currentCards.every((card) => card.isMatched);
                if (allMatched) {
                    setIsWon(true);
                }
                return currentCards;
            });
        }, 100);
    };

    return (
        <div className="w-full bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 mt-10">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">System Defrag</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Match the kernels while waiting</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-wizard-accent/10 rounded-xl border border-wizard-accent/20">
                        <span className="text-[10px] font-black text-wizard-accent uppercase tracking-widest">Moves: {moves}</span>
                    </div>
                    <button
                        onClick={initializeGame}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                        title="Reset Game"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {isWon ? (
                <div className="text-center py-12 animate-fade-in">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-wizard-accent text-black mb-6 animate-bounce">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Defragmentation Complete!</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">You cleared the grid in {moves} moves</p>
                    <button
                        onClick={initializeGame}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                        Play Again
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-3 md:gap-4 aspect-square max-w-sm mx-auto">
                    {cards.map((card) => (
                        <button
                            key={card.id}
                            onClick={() => handleCardClick(card.id)}
                            className={`
                                relative w-full h-full rounded-xl transition-all duration-300 transform perspective-1000
                                ${card.isFlipped ? 'rotate-y-180 bg-wizard-purple/20 border-wizard-purple/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}
                                border
                            `}
                            disabled={card.isMatched}
                        >
                            <div className={`
                                absolute inset-0 flex items-center justify-center transition-opacity duration-300
                                ${card.isFlipped ? 'opacity-100' : 'opacity-0'}
                            `}>
                                <div className={`${card.isMatched ? 'text-wizard-accent' : 'text-wizard-purple'}`}>
                                    {ICONS[card.icon]}
                                </div>
                            </div>
                            <div className={`
                                absolute inset-0 flex items-center justify-center transition-opacity duration-300
                                ${card.isFlipped ? 'opacity-0' : 'opacity-100'}
                            `}>
                                <div className="w-4 h-4 rounded-full bg-white/10" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
