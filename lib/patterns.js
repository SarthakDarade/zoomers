export const PATTERN_TYPES = {
    HERO: 'HERO',          // 1 item, full width, massive
    DUO: 'DUO',            // 2 items, 50/50 or 60/40
    TRIO: 'TRIO',          // 3 items, 33/33/33 or mixed
    ASYNC: 'ASYNC'         // 2 items, offset vertical
}

export function generateLayout(products) {
    const rows = []
    let i = 0

    while (i < products.length) {
        // Deterministic pattern based on index to ensure consistency across renders
        const patternSeed = i % 10

        let chunk = []
        let type = PATTERN_TYPES.HERO

        if (patternSeed === 0 || patternSeed === 5) {
            // HERO: 1 massive item
            chunk = products.slice(i, i + 1)
            type = PATTERN_TYPES.HERO
            i += 1
        } else if (patternSeed === 1 || patternSeed === 4 || patternSeed === 7) {
            // DUO: 2 items
            chunk = products.slice(i, i + 2)
            type = PATTERN_TYPES.DUO
            i += 2
        } else if (patternSeed === 2 || patternSeed === 6) {
            // ASYNC: 2 items offset
            chunk = products.slice(i, i + 2)
            type = PATTERN_TYPES.ASYNC
            i += 2
        } else {
            // TRIO: 3 items
            chunk = products.slice(i, i + 3)
            type = PATTERN_TYPES.TRIO
            i += 3
        }

        if (chunk.length > 0) {
            rows.push({
                id: `row-${i}`,
                type,
                items: chunk
            })
        }
    }

    return rows
}

// Fixed heights for calculation (in pixels approx, or relative logic)
export const getRowHeight = (type) => {
    switch (type) {
        case PATTERN_TYPES.HERO: return 900
        case PATTERN_TYPES.DUO: return 700
        case PATTERN_TYPES.TRIO: return 600
        case PATTERN_TYPES.ASYNC: return 850
        default: return 500
    }
}
