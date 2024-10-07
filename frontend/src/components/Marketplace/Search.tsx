// Import necessary modules and components
import React, { useState } from "react";
import Image from "next/image";
import Input from "@/components/Common/Input";
import { SearchIcon } from "@/components/Common/Icons";
import { useRouter } from "next/router";
import styles from "./styles.module.scss";

const Search = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Function to handle search on Enter key press
  const handleSearch = (key: string) => {
    if (key === "Enter") {
      router.push(`/marketplace/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <div className={`flex items-center justify-center flex-col mt-24 ${styles.search_section}`}>
        {/* Logo and tagline */}
        <Image alt="logo" src="/logo_xl.png" width={100} height={100} />
        <span className="font-actor text-[40px]">Collect. Connect. Thrive.</span>

        {/* Search input field */}
        <Input
          containerClass="w-2/3 mobile:w-full max-w-[660px]"
          placeholder="Search the marketplace"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyUp={(event) => handleSearch(event.key)}
          leftAdornment={
            <button
              className="text-placeholder cursor-pointer"
              onClick={() => router.push(`/marketplace/search?q=${encodeURIComponent(searchQuery)}`)}
              aria-label="Search"
            >
              <SearchIcon className="w-6 h-6" />
            </button>
          }
        />

        {/* Additional text */}
        <span className="font-actor text-[22px]">Look for items, collections and accounts</span>
        <span className="text-[14px] font-thin w-[300px]">The largest marketplace for Sports & E-sports NFTs in the world.</span>
      </div>

      {/* Search border */}
      <div className={`${styles.search_border}`}></div>
    </>
  );
};

export default Search;
