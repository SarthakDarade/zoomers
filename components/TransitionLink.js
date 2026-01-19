'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'

export default function TransitionLink({ href, children, className, ...props }) {
    const router = useRouter()

    const handleClick = (e) => {
        e.preventDefault()

        // Animate OUT current page content
        const target = document.querySelector('main') || document.body

        gsap.to(target, {
            opacity: 0,
            y: -20,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => {
                router.push(href)
            }
        })
    }

    return (
        <Link href={href} onClick={handleClick} className={className} {...props}>
            {children}
        </Link>
    )
}
