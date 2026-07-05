"use client";

import { motion } from "framer-motion";

const Header: React.FC = () => {
  return (
    <header className="w-full z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>

        {/* <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Button variant="outline" className="bg-white hover:bg-gray-50 transition-colors">
            Sign In
          </Button>
        </motion.div> */}
        {/* <Link href="/signup">
  <span>Sign Up</span>
</Link> */}
      </div>
    </header>

    //   <header className="fixed top-0 left-0 z-50 w-full bg-white shadow-md">
    //   <div className="container mx-auto px-4 py-3 flex justify-between items-center">
    //     {/* Logo */}
    //     <Link href="/">
    //       <span className="text-2xl font-bold text-gray-800">traider</span>
    //     </Link>

    //     {/* Desktop Links */}
    //     <nav className="hidden md:flex items-center space-x-6">
    //       {globallinks.map((link) => (
    //         <Link key={link.name} href={link.href} className="text-gray-600 hover:text-black transition-colors">
    //           {link.name}
    //         </Link>
    //       ))}
    //       {isSignedIn && (
    //         <Link href="/simulator" className="text-gray-600 hover:text-black transition-colors">
    //           Simulator
    //         </Link>
    //       )}
    //       <SignedOut>
    //       <Link href="/auth/sign-in" passHref>
    //         <span className="text-gray-600 hover:text-black transition-colors">
    //           Sign In
    //         </span>
    //       </Link>
    //     </SignedOut>
    //       <SignedIn>
    //         <UserButton />
    //       </SignedIn>
    //     </nav>
    //   </div>
    // </header>
  );
};

export default Header;

// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
// import { motion } from "framer-motion"

// const globallinks = [{ name: "About", href: "/about" }];

// const Header = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const { isSignedIn } = useUser();

//   const toggleMenu = () => {
//     setIsOpen((prev) => !prev);
//   };

//   return (
//         <header className="fixed top-0 left-0 z-50 w-full bg-white shadow-md">
//         <div className="container mx-auto px-4 py-3 flex justify-between items-center">
//           {/* Logo */}
//           <Link href="/">
//             <span className="text-2xl font-bold text-gray-800">traider</span>
//           </Link>

//           {/* Hamburger for mobile */}
//           <button
//             onClick={toggleMenu}
//             className="md:hidden text-gray-600 hover:text-black focus:outline-none"
//             aria-label="Toggle menu"
//             aria-expanded={isOpen}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-6 w-6"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
//               />
//             </svg>
//           </button>

//           {/* Desktop Links */}
//           <nav className="hidden md:flex items-center space-x-6">
//             {globallinks.map((link) => (
//               <Link key={link.name} href={link.href} className="text-gray-600 hover:text-black transition-colors">
//                 {link.name}
//               </Link>
//             ))}
//             {isSignedIn && (
//               <Link href="/simulator" className="text-gray-600 hover:text-black transition-colors">
//                 Simulator
//               </Link>
//             )}
//             <SignedOut>
//             <Link href="/auth/sign-in" passHref>
//               <span className="text-gray-600 hover:text-black transition-colors">
//                 Sign In
//               </span>
//             </Link>
//           </SignedOut>
//             <SignedIn>
//               <UserButton />
//             </SignedIn>
//           </nav>
//         </div>

//         {/* Mobile Menu */}
//         {isOpen && (
//           <nav className="md:hidden bg-gray-50 text-black absolute top-12 right-1 shadow-lg rounded-md w-44 p-3">
//             {globallinks.map((link) => (
//               <Link key={link.name} href={link.href} className="block py-2 hover:text-blue-500">
//                 {link.name}
//               </Link>
//             ))}
//             {isSignedIn && (
//               <Link href="/simulator" className="block py-2 hover:text-blue-500">
//                 Simulator
//               </Link>
//             )}
//             <SignedOut>
//             <Link href="/auth/sign-in" passHref>
//               <span
//                 className="block py-2 hover:text-blue-500"
//                 onClick={toggleMenu}
//               >
//                 Sign In
//               </span>
//             </Link>
//           </SignedOut>
//             <SignedIn>
//               <UserButton />
//             </SignedIn>
//           </nav>
//         )}
//       </header>
//     );
// };

// export default Header;
