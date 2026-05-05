import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="bg-primary py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
          Ready to grow your market?
        </h2>
        <p className="mt-4 text-lg text-primary-foreground/70">
          Join AgriFlow today and start connecting with farmers and buyers across Jamaica.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            className="bg-background text-foreground hover:bg-background/90"
            asChild
          >
            <Link href="/register?role=farmer">Get Started as a Farmer</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/60 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            asChild
          >
            <Link href="/register?role=buyer">Join as a Buyer</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
