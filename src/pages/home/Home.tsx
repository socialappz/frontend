
export default function Home() {
  return (
    <main className="bg-white min-h-screen w-full font-['Futura',_sans-serif] text-[#35374B]">
      {/* Navbar */}
      
      {/* Header (Hero Section) */}
      <header className="max-w-[1200px] mx-auto px-6 py-6 md:py-12 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#90E4DD]/40 text-[#006557] px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            🐕 Now in Berlin · Hamburg · Munich
          </div>
          <h1 className="text-5xl md:text-[4rem] font-extrabold leading-[1.1] mb-6 text-[#35374B]">
            Never Walk <br className="hidden md:block" />
            <span className="text-[#00A991]">Alone</span> Again
          </h1>
          <p className="text-lg text-[#35374B] mb-8 max-w-lg leading-relaxed">
            Connect with dog owners near you. Find walking companions, make new friends, and give your dog the social life they deserve.
          </p>
          <div className="flex flex-wrap gap-4 mb-10">
            <button className="bg-[#00A991] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#008774] transition">
              Join the Community
            </button>
            <button className="border-2 border-[#006557] text-[#006557] px-8 py-3.5 rounded-full font-bold hover:bg-[#006557] hover:text-white transition">
              Log in
            </button>
          </div>
          <div className="flex flex-wrap gap-6 text-sm font-bold text-[#006557]">
            <span className="flex items-center gap-2">
              <img src="/check.svg" className="h-4 w-4" alt="Check" /> Free to join
            </span>
            <span className="flex items-center gap-2">
              <img src="/check.svg" className="h-4 w-4" alt="Check" /> 10,000+ dog owners
            </span>
            <span className="flex items-center gap-2">
              <img src="/check.svg" className="h-4 w-4" alt="Check" /> Safe & verified
            </span>
          </div>
        </div>
        <div className="w-full h-[400px] md:h-[650px]">
          <img
            src="/bg_header.png"
            alt="People walking dogs"
            className="w-full h-full object-cover rounded-[3rem]"
          />
        </div>
      </header>

      {/* Main Section 1: Never walk alone */}
      <section className="max-w-[1200px] mx-auto px-6 py-12 grid md:grid-cols-2 gap-8">
        <div className="w-full h-[350px] md:h-auto md:min-h-[500px]">
          <img
            src="/left_main_bild.png"
            alt="Two Golden Retrievers"
            className="w-full h-full object-cover rounded-[2.5rem]"
          />
        </div>
        <div className="bg-[#008774] rounded-[2.5rem] p-12 md:p-16 flex flex-col justify-center">
          <h2 className="text-4xl md:text-[3.2rem] font-extrabold text-white mb-6 leading-tight">
            Never <span className="text-[#004C41]">walk</span> alone
          </h2>
          <p className="text-white text-lg mb-6 leading-relaxed">
            Dinder connects dog lovers in your area. Find new friends for you and your
            dog, share walks, and experience adventures together. No more lonely walks –
            with Dinder, every walk is a chance to meet someone new.
          </p>
          <p className="text-white text-lg leading-relaxed">
            With Dinder, you and your dog will always have company. Find walking
            partners nearby and turn every walk into a shared experience.
          </p>
        </div>
      </section>

      {/* Main Section 2: Meet new People */}
      <section className="max-w-[1200px] mx-auto px-6 py-12 grid md:grid-cols-2 gap-8">
        <div className="bg-[#FCF8EA] rounded-[2.5rem] p-12 md:p-16 flex flex-col justify-center order-2 md:order-1">
          <h2 className="text-4xl md:text-[3.2rem] font-extrabold text-[#35374B] mb-6 leading-tight">
            Meet new <br />
            <span className="text-[#00A991]">People</span>
          </h2>
          <p className="text-[#35374B] text-lg leading-relaxed">
            Discover new friends for you and your dog. Dinder brings together dog lovers
            from your area – for spontaneous walks or planned adventures.
          </p>
        </div>
        <div className="w-full h-[350px] md:h-auto md:min-h-[500px] order-1 md:order-2">
          <img
            src="/right_main_bild.png"
            alt="Two friends with dogs"
            className="w-full h-full object-cover rounded-[2.5rem]"
          />
        </div>
      </section>

      {/* Main Section 3: Share adventures */}
      <section className="max-w-[1200px] mx-auto px-6 py-12 grid md:grid-cols-2 gap-8">
        <div className="w-full h-[350px] md:h-auto md:min-h-[500px]">
          <img
            src="/right_main_bild_2.png"
            alt="Taking a photo of a dog"
            className="w-full h-full object-cover rounded-[2.5rem]"
          />
        </div>
        <div className="bg-[#90E4DD] rounded-[2.5rem] p-12 md:p-16 flex flex-col justify-center">
          <h2 className="text-4xl md:text-[3.2rem] font-extrabold text-white mb-6 leading-tight">
            Share <span className="text-[#004C41]">adventures</span>
          </h2>
          <p className="text-[#35374B] text-lg leading-relaxed">
            Explore new parks, discover hidden paths and create unforgettable
            memories – together with your dog and new friends.
          </p>
        </div>
      </section>

      {/* Main Section 4: How Dinder Works */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#35374B] mb-4">
            How Dinder Works
          </h2>
          <p className="text-[#35374B] text-lg">
            Connect with dog lovers nearby in three simple steps.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-[#FCF8EA] rounded-[2.5rem] p-10 flex flex-col items-center text-center">
            <span className="text-5xl mb-6">🐾</span>
            <h3 className="text-[#00A991] font-bold text-sm tracking-widest uppercase mb-3">
              Step 01
            </h3>
            <h4 className="text-2xl font-extrabold text-[#35374B] mb-4">
              Create Your Profile
            </h4>
            <p className="text-[#35374B] leading-relaxed">
              Set up profiles for you and your dog. Add breed, favourite activities, and
              your walk schedule.
            </p>
          </div>
          {/* Step 2 */}
          <div className="bg-[#004C41] rounded-[2.5rem] p-10 flex flex-col items-center text-center">
            <span className="text-5xl mb-6">🔍</span>
            <h3 className="text-[#90E4DD] font-bold text-sm tracking-widest uppercase mb-3">
              Step 02
            </h3>
            <h4 className="text-2xl font-extrabold text-white mb-4">
              Find Dog Friends
            </h4>
            <p className="text-white leading-relaxed">
              Browse dog owners in your city. Filter by breed, size, energy level, and
              available walk times.
            </p>
          </div>
          {/* Step 3 */}
          <div className="bg-[#FCF8EA] rounded-[2.5rem] p-10 flex flex-col items-center text-center">
            <span className="text-5xl mb-6">⭐</span>
            <h3 className="text-[#00A991] font-bold text-sm tracking-widest uppercase mb-3">
              Step 03
            </h3>
            <h4 className="text-2xl font-extrabold text-[#35374B] mb-4">
              Start Exploring
            </h4>
            <p className="text-[#35374B] leading-relaxed">
              Chat, plan meetups, and share adventures. Build a real community of dog
              lovers right in your neighbourhood.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#004C41] py-16 px-6 mt-12 flex flex-col items-center">
        <img
          src="/logo.png"
          alt="Dinder Logo"
          className="h-10 brightness-0 invert mb-8"
        />
        <div className="flex gap-8 text-white font-bold mb-10">
          <a href="#" className="hover:text-[#90E4DD] transition">Privacy</a>
          <a href="#" className="hover:text-[#90E4DD] transition">Terms</a>
          <a href="#" className="hover:text-[#90E4DD] transition">About</a>
          <a href="#" className="hover:text-[#90E4DD] transition">Contact</a>
        </div>
        <p className="text-[#00A991] text-sm">
          © 2026 Dinder · Made with <span role="img" aria-label="paw">🐾</span> for dogs and their humans
        </p>
      </footer>
    </main>
  );
}