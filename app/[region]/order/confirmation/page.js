import { supabase } from '@/lib/supabase'
import Smoother from '@/components/Smoother'
import OrderSuccess from '@/components/OrderSuccess'
import { notFound } from 'next/navigation'

export const revalidate = 0

export default async function OrderPage({ searchParams }) {
    const { id } = await searchParams

    if (!id) return notFound()

    // Fetch Order + Items + Product Details (for images/names)
    const { data: order, error } = await supabase
        .from('orders')
        .select(`
      *,
      items:order_items (
        *,
        products (
          name,
          image_url
        )
      )
    `)
        .eq('id', id)
        .single()

    if (error || !order) {
        console.error(error)
        return (
            <div className="w-full h-screen flex items-center justify-center text-white bg-black">
                Order not found.
            </div>
        )
    }

    return (
        <Smoother>
            <OrderSuccess order={order} />
        </Smoother>
    )
}
