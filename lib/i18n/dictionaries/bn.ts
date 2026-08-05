import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/** Bengali dictionary. The site name/brand stays in Latin script throughout
 * (common Bengali convention for brand names, same as keeping a logo
 * untranslated) — everything else is genuine Bengali prose, not
 * transliterated/Banglish English. Interpolated numbers stay as plain Arabic
 * numerals (via JS number-to-string), matching how Bengali digital products
 * commonly mix Bengali script with Arabic numerals. */
export const bn: Dictionary = {
  site: {
    name: "World Kitchen Atlas",
    description:
      "একটি বৈশ্বিক রন্ধন বিশ্বকোষ, মহাদেশ, দেশ ও পদ অনুসারে সাজানো — প্রতিটি এন্ট্রির ইতিহাস, উপলক্ষ ও ঐতিহ্যবাহী পানীয়ের সংযোগসহ।",
  },
  nav: {
    search: "অনুসন্ধান",
    about: "সম্পর্কে",
    continents: "মহাদেশ",
    browse: "ব্রাউজ করুন",
    openMenu: "মেনু খুলুন",
    closeMenu: "মেনু বন্ধ করুন",
    switchLanguage: "ভাষা পরিবর্তন করুন",
  },
  footer: {
    copyright: (year) =>
      `© ${year} World Kitchen Atlas। সমস্ত কনটেন্ট মৌলিক; অননুমোদিত পুনরুৎপাদন নিষিদ্ধ।`,
  },
  home: {
    title: "World Kitchen Atlas",
    heroParagraph:
      "একটি বৈশ্বিক রন্ধন বিশ্বকোষ — মহাদেশ, দেশ ও পদ — প্রতিটি এন্ট্রির পেছনের ইতিহাস, উপলক্ষ ও ঐতিহ্যবাহী পানীয়ের সংযোগসহ।",
    exploreByContinent: "মহাদেশ অনুসারে ঘুরে দেখুন",
    browseByMealTime: "খাবারের সময় অনুসারে ব্রাউজ করুন",
    countryCount: () => "দেশ",
    dishCount: () => "পদ",
    comingSoonLabel: "শীঘ্রই আসছে",
  },
  notFound: {
    title: "404",
    description: "এই পাতাটি এখনও অ্যাটলাসে নেই।",
  },
  about: {
    metaTitle: "সম্পর্কে",
    metaDescription:
      "World Kitchen Atlas-এর পদ্ধতি ও নির্ভুলতার দাবিত্যাগ — কীভাবে পদগুলো গবেষণা, উৎসায়ন ও নির্ভরযোগ্যতা-রেটিং করা হয়।",
    heading: "সম্পর্কে",
    whatThisIs: {
      heading: "এটি আসলে কী",
      body: "World Kitchen Atlas প্রতিটি দেশের জন্য পদের একটি প্রকৃত ভিত্তি তৈরির লক্ষ্য রাখে — প্রধান খাবার, স্ট্রিট ফুড, মিষ্টান্ন, রুটি ও ঐতিহ্যবাহী পানীয় — মহাদেশ ও দেশ অনুযায়ী সাজানো, যাতে প্রতিটি পদ সত্যিই কোথা থেকে এসেছে তা সবসময় খুঁজে বের করা যায়।",
    },
    coverageVaries: {
      heading: "দেশভেদে কভারেজ ভিন্ন, সততার সাথেই বলা হচ্ছে",
      body: "বড় ও সুপরিচিত রন্ধনশৈলী — ভারত, চীন, ইতালি, ফ্রান্স, বাংলাদেশ, জাপান, মেক্সিকো, তুরস্ক এবং আরও অনেক দেশ — গভীর ও নির্ভরযোগ্য কভারেজ পায়, প্রায়ই মূল ভিত্তির চেয়েও বেশি। কিছু খুব ছোট দেশ (প্রশান্ত মহাসাগরীয় ক্ষুদ্র রাষ্ট্র, অথবা ভ্যাটিকান সিটি, লিশটেনস্টাইন, মোনাকো, সান মারিনোর মতো নগর-রাষ্ট্র) থেকে টানার মতো ততগুলো স্বতন্ত্রভাবে নথিভুক্ত পদ নেই। এসব ক্ষেত্রে, এই অ্যাটলাস যা সত্যিকারভাবে নিশ্চিত করা যায় তা-ই তালিকাভুক্ত করে ও তা স্পষ্টভাবে জানিয়ে দেয়, বানানো বা সাধারণ ফিলার দিয়ে সংখ্যা বাড়ানোর বদলে।",
    },
    noInvented: {
      heading: "কোনো বানানো পদ নেই, মিথ্যা নির্ভুলতাও নেই",
      body: "এই সাইটের প্রতিটি পদ সত্যিকারের — তালিকা পূরণ করার জন্য কোনোটিই বানানো হয়নি। যেখানে কোনো পদের সঠিক উদ্ভবের বছর নিশ্চিত নয় (যা খাদ্য-ইতিহাসে সাধারণ ব্যাপার), সেখানে এন্ট্রিটি একটি নির্দিষ্ট তারিখকে সত্য বলে দাবি না করে সাধারণ রন্ধন-ঐকমত্য প্রতিফলিত করে।",
    },
    confidenceLevels: {
      heading: "নির্ভরযোগ্যতার মাত্রা",
      body: "প্রতিটি এন্ট্রিতে একটি নির্ভরযোগ্যতা রেটিং থাকে — এর অ্যাটলাস পিন ব্যাজে টিক চিহ্ন হিসেবে দেখানো হয় — যা প্রতিফলিত করে সেই পদের ইতিহাস ও বিবরণ কতটা সুপরিচিতভাবে নথিভুক্ত। উচ্চ নির্ভরযোগ্যতার জন্য তিনটি টিক, আর পাতলা উৎস থেকে তৈরি এন্ট্রির জন্য একটি টিক। এটি নকশার একটি ইচ্ছাকৃত অংশ, কোনো পরবর্তী চিন্তা নয় — এই অ্যাটলাস তার অনিশ্চয়তা লুকানোর চেয়ে তা দেখাতেই বেশি পছন্দ করে।",
    },
    somethingInaccurate: {
      heading: "কিছু ভুল মনে হচ্ছে?",
      body: "যদি এখানে কোনো পদ, উৎস বা ঐতিহাসিক তথ্য ভুল মনে হয়, তা জানানো উচিত — এই অ্যাটলাস এখনও একটি চলমান কাজ, কোনো সম্পূর্ণ ও চূড়ান্ত দলিল নয়।",
    },
  },
  search: {
    metaTitle: "অনুসন্ধান",
    metaDescription:
      "নাম, দেশ বা বিবরণ অনুযায়ী প্রতিটি নথিভুক্ত পদ খুঁজুন, মহাদেশ, খাবারের সময়, ডায়েট ও উপলক্ষ ফিল্টার সহ।",
    heading: "অনুসন্ধান",
    srLabel: "পদ, দেশ বা উপকরণ খুঁজুন",
    placeholder: "পদ, দেশ বা উপকরণ খুঁজুন…",
    submit: "খুঁজুন",
    noResultsForQuery: (q) => `"${q}"-এর সাথে কোনো পদ মিলছে না।`,
    noResultsFilters: "এই ফিল্টারগুলোর সাথে কোনো পদ মিলছে না।",
  },
  submitRecipe: {
    metaTitle: "একটি রেসিপি জমা দিন",
    metaDescription: "World Kitchen Atlas-এর গবেষণা ও সংযোজনের জন্য একটি পদ শেয়ার করুন।",
    title: "একটি রেসিপি জমা দিন",
    description: "রেসিপি জমাদানের ফর্ম এখানে আসবে।",
  },
  mealHubs: {
    breakfast: {
      title: "সকালের নাশতা",
      description: "প্রতিটি নথিভুক্ত দেশের সকালের নাশতার পদ, ডায়েট ও উপলক্ষ ফিল্টার সহ।",
      emptyMessage: "এখনও কোনো সকালের নাশতার পদ নথিভুক্ত করা হয়নি।",
    },
    lunch: {
      title: "দুপুরের খাবার",
      description: "প্রতিটি নথিভুক্ত দেশের দুপুরের খাবারের পদ, ডায়েট ও উপলক্ষ ফিল্টার সহ।",
      emptyMessage: "এখনও কোনো দুপুরের খাবারের পদ নথিভুক্ত করা হয়নি।",
    },
    dinner: {
      title: "রাতের খাবার",
      description: "প্রতিটি নথিভুক্ত দেশের রাতের খাবারের পদ, ডায়েট ও উপলক্ষ ফিল্টার সহ।",
      emptyMessage: "এখনও কোনো রাতের খাবারের পদ নথিভুক্ত করা হয়নি।",
    },
    snacks: {
      title: "স্ন্যাকস",
      description: "প্রতিটি নথিভুক্ত দেশের স্ন্যাকস জাতীয় পদ, ডায়েট ও উপলক্ষ ফিল্টার সহ।",
      emptyMessage: "এখনও কোনো স্ন্যাকস পদ নথিভুক্ত করা হয়নি।",
    },
    dessert: {
      title: "মিষ্টান্ন",
      description: "প্রতিটি নথিভুক্ত দেশের মিষ্টান্ন জাতীয় পদ, ডায়েট ও উপলক্ষ ফিল্টার সহ।",
      emptyMessage: "এখনও কোনো মিষ্টান্ন পদ নথিভুক্ত করা হয়নি।",
    },
    drinks: {
      title: "পানীয়",
      description: "প্রতিটি নথিভুক্ত দেশের পানীয় জাতীয় পদ, ডায়েট ও উপলক্ষ ফিল্টার সহ।",
      emptyMessage: "এখনও কোনো পানীয় জাতীয় পদ নথিভুক্ত করা হয়নি।",
    },
    streetFood: {
      title: "স্ট্রিট ফুড",
      description: "প্রতিটি নথিভুক্ত দেশের স্ট্রিট ফুড জাতীয় পদ, ডায়েট ও খাবারের সময় ফিল্টার সহ।",
      emptyMessage: "এখনও কোনো স্ট্রিট ফুড পদ নথিভুক্ত করা হয়নি।",
    },
    festivalFood: {
      title: "উৎসবের খাবার",
      description: "প্রতিটি নথিভুক্ত দেশের উৎসবের পদ, ডায়েট ও খাবারের সময় ফিল্টার সহ।",
      emptyMessage: "এখনও কোনো উৎসবের পদ নথিভুক্ত করা হয়নি।",
    },
  },
  continent: {
    metaDescription: (name) => `${name} থেকে দেশ ও পদসমূহ, World Kitchen Atlas-এর একটি অংশ।`,
    noCountries: (name) => `${name}-এর জন্য এখনও কোনো দেশ নথিভুক্ত করা হয়নি।`,
    dishCount: () => "পদ",
  },
  country: {
    metaDescription: (dishCount, name) =>
      `${name} থেকে ${dishCount}টি পদের এন্ট্রি — ইতিহাস, উপলক্ষ ও ঐতিহ্যবাহী পানীয়ের সংযোগসহ।`,
    emptyMessage: "এই ফিল্টারগুলোর সাথে কোনো পদ মিলছে না।",
    traditionalDrinks: "ঐতিহ্যবাহী পানীয়",
  },
  dish: {
    equipment: "সরঞ্জাম",
    miseEnPlace: "প্রস্তুতি",
    doneness: "সম্পন্নতা",
    plating: "পরিবেশন",
    storage: "সংরক্ষণ",
    chefTips: "শেফের পরামর্শ",
    substitutions: "বিকল্প উপকরণ",
    regionalVariations: "আঞ্চলিক ভিন্নতা",
    pairedDrink: "সাথের পানীয়",
  },
  discoveryDetail: {
    history: "ইতিহাস",
    whenEaten: "কখন খাওয়া হয়",
    pairedDrink: "সাথের পানীয়",
    comingSoon: "সম্পূর্ণ রেসিপি শীঘ্রই আসছে।",
  },
  filters: {
    continent: "মহাদেশ",
    dietary: "ডায়েট",
    mealTime: "খাবারের সময়",
    occasion: "উপলক্ষ",
    clearAll: "সব ফিল্টার মুছুন",
    clearOccasion: "উপলক্ষের ফিল্টার মুছুন",
    occasionSearchPlaceholder: "উপলক্ষ খুঁজুন…",
    occasionNoMatches: "কোনো উপলক্ষ মিলছে না।",
  },
  dishGrid: {
    emptyDefault: "এখনও কোনো পদ মিলছে না।",
  },
  dishCard: {
    fullRecipe: "সম্পূর্ণ রেসিপি",
    discoveryEntry: "সংক্ষিপ্ত এন্ট্রি",
  },
  confidence: {
    high: "যাচাইকৃত",
    medium: "সম্ভাব্য",
    low: "অযাচাইকৃত",
    ariaLabel: (level) => `নির্ভরযোগ্যতা: ${level}`,
  },
  recipeSummary: {
    difficulty: "কঠিনতার মাত্রা",
    totalTime: "মোট সময়",
    spiceLevel: "ঝালের মাত্রা",
    bestFor: "উপযুক্ত উপলক্ষ",
    dietary: "ডায়েট",
  },
  servingsIngredients: {
    servings: "পরিবেশন সংখ্যা",
    decreaseServings: "পরিবেশন সংখ্যা কমান",
    increaseServings: "পরিবেশন সংখ্যা বাড়ান",
    resetTo: (n) => `${n}-এ ফিরিয়ে নিন`,
    nutritionHeading: "পুষ্টিমান (প্রতি পরিবেশন ব্যাচে)",
    calories: "ক্যালরি",
    protein: "প্রোটিন",
    carbs: "শর্করা",
    fat: "চর্বি",
    satFat: "স্যাচুরেটেড ফ্যাট",
  },
  recipeSteps: {
    visualCue: "দৃশ্য সংকেত — ",
    commonMistake: "সাধারণ ভুল — ",
  },
  recipeStory: {
    history: "ইতিহাস",
    origin: "উৎস",
    culturalSignificance: "সাংস্কৃতিক তাৎপর্য",
    traditionalBackground: "ঐতিহ্যগত পটভূমি",
    heading: "গল্প",
    interestingFacts: "মজার তথ্য",
  },
  healthInformation: {
    disclaimer:
      "শুধুমাত্র তথ্যের জন্য, চিকিৎসা বা ডায়েট সংক্রান্ত পরামর্শ নয়। পুষ্টিমান আনুমানিক এবং ব্র্যান্ড ও প্রস্তুতপ্রণালী অনুযায়ী ভিন্ন হতে পারে।",
    heading: "স্বাস্থ্য তথ্য",
    benefits: "উপকারিতা",
    allergens: "অ্যালার্জেন",
    dietaryConsiderations: "ডায়েট সংক্রান্ত বিবেচনা",
  },
  cookMode: {
    startCooking: "রান্না শুরু করুন",
    timerDoneAnnouncement: (title) => `${title}-এর টাইমার শেষ হয়েছে।`,
    miseEnPlace: "প্রস্তুতি",
    stepAnnouncement: (current, total, title) => `ধাপ ${current}, মোট ${total}: ${title}`,
    ariaLabel: (dishName) => `কুক মোড — ${dishName}`,
    stepStatus: (current, total) => `ধাপ ${current} / ${total}`,
    servings: "পরিবেশন সংখ্যা",
    decreaseServings: "পরিবেশন সংখ্যা কমান",
    increaseServings: "পরিবেশন সংখ্যা বাড়ান",
    close: "বন্ধ করুন",
    stepsAriaLabel: "ধাপসমূহ",
    previous: "পূর্ববর্তী",
    finish: "সম্পন্ন",
    next: "পরবর্তী",
    markStepDone: "ধাপ সম্পন্ন হিসেবে চিহ্নিত করুন",
  },
  stepTimer: {
    readyAt: (time) => `প্রস্তুত হবে ${time}-এ`,
    timerDone: "টাইমার শেষ",
    start: "শুরু",
    pause: "বিরতি",
    addMinute: "+১ মিনিট",
    resume: "আবার শুরু করুন",
    reset: "রিসেট",
  },
};
