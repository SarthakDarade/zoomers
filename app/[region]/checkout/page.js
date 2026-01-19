import Smoother from '@/components/Smoother'
import CheckoutForm from '@/components/CheckoutForm'

export const revalidate = 0

export default function CheckoutPage() {
    return (
        <Smoother>
            <CheckoutForm />
        </Smoother>
    )
}
