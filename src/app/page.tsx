import Link from "next/link";
import Image from "next/image";

function ArrowIcon() {
  return (
    <svg className="btn-arrow" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-[70rem] mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-12">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left animate-fade-up">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[5rem] font-light leading-tight tracking-tight text-white mb-8">
              Earn real income. Stay completely anonymous. No explicit content required.
            </h1>
            <Link href="/signup" className="btn-primary">
              Apply as Creator! <ArrowIcon />
            </Link>
          </div>
          <div className="flex-shrink-0 animate-zoom-out">
            <Image
              src="/images/image01.jpg"
              alt="Creator"
              width={400}
              height={500}
              className="rounded-2xl object-cover max-h-[500px]"
              priority
            />
          </div>
        </div>
      </section>

      {/* How to Get Started - Creators */}
      <section className="max-w-[70rem] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="text-center animate-fade-up">
          <p className="text-accent font-semibold text-lg mb-4">Creators</p>
          <h2 className="font-heading text-3xl md:text-4xl font-light text-white mb-6">
            How to Get Started
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8 font-light">
            Join a private, professional platform built for creators who value their privacy.
            No face or nudity required. Upload tasteful, anonymous content and start earning
            from a growing subscriber base.
          </p>
          <Link href="/signup" className="btn-primary">
            Apply Now! <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* Why Creators Join */}
      <section className="max-w-[70rem] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 animate-fade-up">
            <h2 className="font-heading text-3xl md:text-4xl font-light text-white mb-8">
              Why Creators Join
            </h2>
            <ul className="space-y-4 mb-8">
              {[
                "No face or nudity required — stay 100% anonymous.",
                "No DMs or fan interaction.",
                "Earn monthly from one simple platform.",
                "Work on your own schedule.",
                "Safe, professional and low pressure.",
                "No existing audience needed.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-white/70 text-lg font-light">
                  <span className="text-accent mt-1 flex-shrink-0">&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="btn-primary">
              Join Now! <ArrowIcon />
            </Link>
          </div>
          <div className="flex-shrink-0 flex gap-4 animate-zoom-out">
            <Image
              src="/images/image07.jpg"
              alt="Creator content"
              width={250}
              height={350}
              className="rounded-2xl object-cover"
            />
            <Image
              src="/images/image05.jpg"
              alt="Creator content"
              width={250}
              height={350}
              className="rounded-2xl object-cover hidden md:block"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-[70rem] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="text-center animate-fade-up">
          <h2 className="font-heading text-3xl md:text-4xl font-light text-white mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                step: "1",
                title: "Apply",
                desc: "Sign up and get approved as a creator.",
              },
              {
                step: "2",
                title: "Upload",
                desc: "Share tasteful anonymous content privately.",
              },
              {
                step: "3",
                title: "Earn",
                desc: "Get paid monthly from subscriber revenue.",
              },
            ].map((item) => (
              <div key={item.step} className="glass-card p-8">
                <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-heading text-2xl text-white mb-3">{item.title}</h3>
                <p className="text-white/70 font-light">{item.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/signup" className="btn-primary">
            Become a Creator now! <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* Unlimited Access - Fans */}
      <section className="max-w-[70rem] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
          <div className="flex-1 text-center lg:text-left animate-fade-up">
            <h2 className="font-heading text-4xl md:text-5xl font-light text-white mb-6">
              Unlimited Access
            </h2>
            <p className="text-white/70 text-lg font-light mb-8">
              Discover premium, tasteful content from verified anonymous creators.
              Subscribe once and get full access. New content added regularly.
            </p>
            <Link href="/signup?role=fan" className="btn-primary">
              Become a Fan! <ArrowIcon />
            </Link>
          </div>
          <div className="flex-shrink-0 animate-zoom-out">
            <Image
              src="/images/image09.jpg"
              alt="Fan access"
              width={400}
              height={500}
              className="rounded-2xl object-cover max-h-[500px]"
            />
          </div>
        </div>
      </section>

      {/* CTA + Pricing */}
      <section className="max-w-[70rem] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="text-center animate-fade-up mb-12">
          <p className="text-white/70 text-lg font-light max-w-2xl mx-auto mb-4">
            Earn real income without sacrificing your privacy or comfort.
            Upload content on your own terms.
          </p>
          <p className="text-white/45 text-sm">
            Join today and get access to exclusive content.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto glass-card p-10 text-center animate-fade-up">
          <div className="font-heading text-5xl md:text-6xl font-light text-white mb-4">
            $19.99
          </div>
          <p className="text-white/70 font-light mb-8">
            Unlimited access to exclusive content from verified creators.
            One subscription. Cancel anytime.
          </p>
          <Link href="/signup?role=fan" className="btn-secondary">
            Join Now! <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-[70rem] mx-auto px-6 md:px-12 py-12 text-center">
        <p className="font-heading text-2xl text-white/70 mb-6">
          Earn on your terms. Stay private. Get paid
        </p>
        <p className="text-white/45 text-sm mb-4">
          &copy; OurSociete 2026 All Rights Reserved
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-white/45">
          <Link href="/acceptable-use" className="hover:text-white/70 transition-colors">
            Acceptable Use Policy
          </Link>
          <Link href="/privacy" className="hover:text-white/70 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white/70 transition-colors">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-white/70 transition-colors">
            Contact Us
          </Link>
        </div>
      </footer>
    </main>
  );
}
