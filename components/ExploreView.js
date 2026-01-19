'use client'
import { memo } from 'react'
import { VariableSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import AutoSizer from 'react-virtualized-auto-sizer'
import ProductModule from './ProductModule'
import { PATTERN_TYPES, getRowHeight } from '@/lib/patterns'

// Row Component
const Row = memo(({ data, index, style }) => {
    const { rows } = data
    const row = rows[index]

    if (!row) return <div style={style} className="w-full flex justify-center items-center text-white/20">Loading...</div>

    let content = null

    if (row.type === PATTERN_TYPES.HERO) {
        content = (
            <div className="w-full h-full px-4 md:px-12 py-12">
                <ProductModule product={row.items[0]} index={index} isSimple={true} />
            </div>
        )
    } else if (row.type === PATTERN_TYPES.DUO) {
        content = (
            <div className="w-full h-full flex gap-4 md:gap-12 px-4 md:px-12 py-12">
                <div className="w-1/2 h-full"><ProductModule product={row.items[0]} index={index * 2} isSimple={true} /></div>
                <div className="w-1/2 h-full mt-24"><ProductModule product={row.items[1]} index={index * 2 + 1} isSimple={true} /></div>
            </div>
        )
    } else if (row.type === PATTERN_TYPES.TRIO) {
        content = (
            <div className="w-full h-full flex gap-4 md:gap-8 px-4 md:px-12 py-12">
                <div className="w-1/3 h-full"><ProductModule product={row.items[0]} index={index * 3} isSimple={true} /></div>
                <div className="w-1/3 h-full mt-12"><ProductModule product={row.items[1]} index={index * 3 + 1} isSimple={true} /></div>
                <div className="w-1/3 h-full mt-24"><ProductModule product={row.items[2]} index={index * 3 + 2} isSimple={true} /></div>
            </div>
        )
    } else {
        // ASYNC
        content = (
            <div className="w-full h-full flex gap-4 md:gap-24 px-4 md:px-24 py-12 justify-between">
                <div className="w-[45%] h-[80%]"><ProductModule product={row.items[0]} index={index * 2} isSimple={true} /></div>
                <div className="w-[45%] h-full pt-40"><ProductModule product={row.items[1]} index={index * 2 + 1} isSimple={true} /></div>
            </div>
        )
    }

    return (
        <div style={style}>
            {content}
        </div>
    )
})
Row.displayName = 'Row'

export default function ExploreView({ rows, isItemLoaded, loadMoreItems, totalItems }) {
    // If no rows, show loading
    if (!rows || rows.length === 0) return null

    return (
        <section className="w-full h-screen bg-[#050505] fixed inset-0 z-50 pt-20">
            <div className="absolute top-0 left-0 w-full h-20 bg-[#050505] z-50 flex justify-between items-center px-8 border-b border-white/10">
                <span className="text-xs uppercase tracking-widest text-white/50">Explore Mode</span>
                <span className="text-xs uppercase tracking-widest text-white/50">{totalItems} Artifacts</span>
            </div>

            <AutoSizer>
                {({ height, width }) => (
                    <InfiniteLoader
                        isItemLoaded={isItemLoaded}
                        itemCount={totalItems} // Total individual items? No, we need total ROWS. But InfiniteLoader thinks in items.
                        // Complex disconnect: InfiniteLoader works on items. We are rendering ROWS.
                        // Ideally, we pass row count.
                        // We'll manage "loadMoreItems" to ask for more rows basically.
                        loadMoreItems={loadMoreItems}
                        threshold={2}
                    >
                        {({ onItemsRendered, ref }) => (
                            <List
                                className="no-scrollbar"
                                height={height - 80} // header offset
                                itemCount={rows.length}
                                itemSize={(index) => getRowHeight(rows[index]?.type)}
                                onItemsRendered={onItemsRendered}
                                ref={ref}
                                width={width}
                                itemData={{ rows }}
                            >
                                {Row}
                            </List>
                        )}
                    </InfiniteLoader>
                )}
            </AutoSizer>
        </section>
    )
}
