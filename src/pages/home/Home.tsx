import sadWalk from "/sad_walk.webp";
import discoverdPeople from "/discoverd_dog.webp";
import meetPeople from "/meet_new_people_dog.png";
import walkAdventure from "/walk_adventure.webp";
import signUpDog from "/signup_dog.webp";
import walksafe from "/walksafe.webp";
import share from "/share.webp";
import walkSomePeople from "/home_gifi.gif";

export default function Home() {
  return (
    <main className="bg-white min-h-screen w-full text-black font-sans">
      {/* Header */}
      <header className="max-w-4xl mx-auto flex flex-col items-center gap-6 py-12 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center">
          Never Walk Alone Again
        </h1>
        <p className="text-lg md:text-xl text-gray-700 text-center max-w-2xl">
          Dinder connects dog lovers in your area. Find new friends for you and
          your dog, share walks, and experience adventures together. No more
          lonely walks – with Dinder, every walk is a chance to meet someone
          new.
        </p>
        <img
          src={walkSomePeople}
          alt="People walking dogs"
          className="w-full max-w-2xl aspect-[4/3] object-cover rounded-2xl shadow-lg mt-4 transition duration-300 hover:shadow-2xl hover:grayscale"
        />
      </header>

      {/* Benefits Section */}
      <section className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center bg-white! rounded-2xl p-6 shadow-lg">
          <img
            src={sadWalk}
            alt="Never alone"
            className="max-h-48 w-auto mx-auto mb-4 object-contain"
          />
          <h2 className="text-xl font-bold mb-2 text-center">
            Never walk alone
          </h2>
          <p className="text-gray-700 text-center">
            With Dinder, you and your dog will always have company. Find walking
            partners nearby and turn every walk into a shared experience.
          </p>
        </div>
        <div className="flex flex-col items-center bg-white! rounded-2xl p-6 shadow-lg">
          <img
            src={meetPeople}
            alt="New friends"
            className="max-h-48 w-auto mx-auto mb-4 object-contain"
          />
          <h2 className="text-xl font-bold mb-2 text-center">
            Meet new people
          </h2>
          <p className="text-gray-700 text-center">
            Discover new friends for you and your dog. Dinder brings together
            dog lovers from your area – for spontaneous walks or planned
            adventures.
          </p>
        </div>
        <div className="flex flex-col items-center bg-white! rounded-2xl p-6 shadow-lg">
          <img
            src={walkAdventure}
            alt="Adventures"
            className="max-h-48 w-auto mx-auto mb-4 object-contain"
          />
          <h2 className="text-xl font-bold mb-2 text-center">
            Share adventures
          </h2>
          <p className="text-gray-700 text-center">
            Explore new parks, discover hidden paths and create unforgettable
            memories – together with your dog and new friends.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-10">
          How Dinder works
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center bg-white! rounded-2xl p-6 shadow-lg hover:grayscale-50">
            <img
              src={signUpDog}
              alt="Step 1"
              className="max-h-48 w-auto mx-auto mb-4 object-contain transition duration-300"
            />
            <h3 className="font-semibold mb-2 text-center">Sign up</h3>
            <p className="text-gray-700 text-center">
              Create your free Dinder profile and tell us about you and your
              dog.
            </p>
          </div>
          <div className="flex flex-col items-center bg-white! rounded-2xl p-6 shadow-lg hover:grayscale-50">
            <img
              src={discoverdPeople}
              alt="Step 2"
              className="max-h-48 w-auto mx-auto mb-4 object-contain transition duration-300"
            />
            <h3 className="font-semibold mb-2 text-center">Find matches</h3>
            <p className="text-gray-700 text-center">
              Discover people and dogs in your area who are looking for walking
              partners.
            </p>
          </div>
          <div className="flex flex-col items-center bg-white! rounded-2xl p-6 shadow-lg hover:grayscale-50">
            <img
              src={walksafe}
              alt="Step 3"
              className="max-h-48 w-auto mx-auto mb-4 object-contain transition duration-300"
            />
            <h3 className="font-semibold mb-2 text-center">Go for a walk</h3>
            <p className="text-gray-700 text-center">
              Arrange a walk, meet up and enjoy the time together – for you and
              your dog.
            </p>
          </div>
          <div className="flex flex-col items-center bg-white! rounded-2xl p-6 shadow-lg hover:grayscale-50">
            <img
              src={share}
              alt="Step 4"
              className="max-h-48 w-auto mx-auto mb-4 object-contain transition duration-300"
            />
            <h3 className="font-semibold mb-2 text-center">Share your story</h3>
            <p className="text-gray-700 text-center">
              Share your experiences and inspire others to join the Dinder
              community.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-500 text-sm mt-10">
        <h3 className="text-lg font-bold mb-2">Ready to change your walks?</h3>
        <p>Start your next adventure is just some clicks away!</p>
        <p className="love mt-8">
          Created with love for all dog lovers{" "}
          <span role="img" aria-label="love">
            ❤️
          </span>
        </p>
      </footer>
    </main>
  );
}
